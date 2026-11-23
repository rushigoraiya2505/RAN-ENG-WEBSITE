// Run with Node 24+: node --experimental-strip-types --test scripts/test-enquiry-worker.mjs
// These tests call the real worker with multipart Requests and the real migration SQL.
// Only the platform bindings are substituted: SQLite for D1 and an in-memory R2 bucket.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import worker from '../worker/index.ts';
import { CHALLENGE_LIFETIME, MAX_ATTACHMENT_BYTES, MAX_BODY_BYTES, MIN_FORM_AGE } from '../worker/enquiry-validation.ts';

const ORIGIN = 'https://ran-engineers.example.invalid';
const START = Date.parse('2026-11-21T12:00:00Z');
const HOUR = 60 * 60 * 1000;
const CLIENT_IP = '192.0.2.41';
const BASE_FIELDS = {
  fullName: '  Integration Test  ',
  company: 'Synthetic company — no follow-up',
  phone: '+91 12345 67890',
  email: 'integration@example.invalid',
  requirement: 'Dam Electrical & Mechanical Works',
  location: 'Synthetic test location',
  quantity: 'One test installation',
  message: 'This is a local integration test; no message is sent to any external service.',
  consent: 'agreed',
  website: '',
};
const DRAWING = '%PDF-1.7\nSynthetic drawing, integration test only.\n%%EOF';
const drawing = (contents = DRAWING, name = 'control-drawing.pdf') => new File([contents], name, { type: 'application/pdf' });

class SQLiteStatement {
  constructor(db, sql, values = []) { this.db = db; this.sql = sql; this.values = values; }
  bind(...values) { return new SQLiteStatement(this.db, this.sql, values); }
  async first(column) {
    if (this.db.receiptReadFailures > 0 && /FROM\s+enquiries\s+WHERE\s+request_key\s*=/i.test(this.sql)) {
      this.db.receiptReadFailures -= 1;
      throw new Error('Injected temporary receipt-read failure');
    }
    const result = this.db.sqlite.prepare(this.sql).get(...this.values) ?? null;
    // Holding a read AFTER obtaining its value forces a real stale-preflight race.
    if (this.db.afterFirst) await this.db.afterFirst({ sql: this.sql, values: this.values, result });
    return column && result ? result[column] : result;
  }
  async all() { return this.db.execute(this); }
  async run() { return this.db.execute(this); }
}

class SQLiteD1 {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec('PRAGMA foreign_keys = ON');
    const directory = new URL('../drizzle/', import.meta.url);
    this.migrations = readdirSync(directory).filter(name => /^\d{4}_.*\.sql$/.test(name)).sort();
    assert.ok(this.migrations.some(name => name.startsWith('0000_')), 'Initial migration must be exercised');
    assert.ok(this.migrations.some(name => name.startsWith('0001_')), 'Payload-hash migration must be exercised');
    for (const name of this.migrations) this.sqlite.exec(readFileSync(new URL(name, directory), 'utf8'));
    this.afterFirst = null;
    this.commitFailure = null;
    this.receiptReadFailures = 0;
    this.injectedAcknowledgementFailures = 0;
  }
  prepare(sql) { return new SQLiteStatement(this, sql); }
  execute(prepared) {
    const statement = this.sqlite.prepare(prepared.sql);
    let results = [], changes = 0, lastRowId = 0;
    if (statement.columns().length) {
      results = statement.all(...prepared.values);
      if (!/^\s*(SELECT|PRAGMA)\b/i.test(prepared.sql)) changes = Number(this.sqlite.prepare('SELECT changes() AS count').get().count);
    } else {
      const result = statement.run(...prepared.values);
      changes = Number(result.changes);
      lastRowId = Number(result.lastInsertRowid);
    }
    return { success: true, results, meta: { changes, last_row_id: lastRowId, duration: 0 } };
  }
  async batch(statements) {
    // Like D1 batches, every statement executes in one transaction; an error rolls it back.
    this.sqlite.exec('BEGIN IMMEDIATE');
    let results;
    try {
      results = statements.map(statement => this.execute(statement));
      this.sqlite.exec('COMMIT');
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
    if (this.commitFailure && statements.some(statement => /INSERT\s+INTO\s+enquiries\b/i.test(statement.sql))) {
      const fault = this.commitFailure;
      this.commitFailure = null;
      this.receiptReadFailures = fault.failReconciliationRead ? 1 : 0;
      this.injectedAcknowledgementFailures += 1;
      // The transaction really committed. Only the caller's acknowledgement is lost.
      throw new Error('Injected acknowledgement loss after committed enquiry transaction');
    }
    return results;
  }
  failAfterNextEnquiryCommit({ failReconciliationRead = false } = {}) { this.commitFailure = { failReconciliationRead }; }
  rows(sql, ...values) { return this.sqlite.prepare(sql).all(...values); }
  row(sql, ...values) { return this.sqlite.prepare(sql).get(...values) ?? null; }
  close() { this.sqlite.close(); }
}

class MemoryR2 {
  constructor() { this.objects = new Map(); this.puts = []; this.deletes = []; this.afterPut = null; this.failNextPut = false; }
  async put(key, value, options = {}) {
    if (this.failNextPut) { this.failNextPut = false; throw new Error('Injected bucket write failure'); }
    const bytes = new Uint8Array(await new Response(value).arrayBuffer());
    this.objects.set(key, { bytes, options: structuredClone(options) });
    this.puts.push(key);
    if (this.afterPut) await this.afterPut(key);
    return { key, size: bytes.byteLength, etag: 'local-integration-test' };
  }
  async delete(key) {
    for (const item of Array.isArray(key) ? key : [key]) { this.deletes.push(item); this.objects.delete(item); }
  }
}

function fixture(t) {
  t.mock.timers.enable({ apis: ['Date'], now: START });
  const DB = new SQLiteD1(), BUCKET = new MemoryR2();
  const env = { DB, BUCKET, ASSETS: { fetch: async () => new Response('No local test asset', { status: 404 }) } };
  t.after(() => DB.close());
  return { env, DB, BUCKET, advance: milliseconds => t.mock.timers.tick(milliseconds) };
}

function headers(overrides = {}) {
  const result = new Headers({ Origin: ORIGIN, 'Sec-Fetch-Site': 'same-origin', 'CF-Connecting-IP': CLIENT_IP, Accept: 'application/json' });
  for (const [key, value] of Object.entries(overrides)) value === null ? result.delete(key) : result.set(key, value);
  return result;
}

async function request(h, path, options = {}) {
  const response = await worker.fetch(new Request(`${ORIGIN}${path}`, { ...options, headers: headers(options.headers) }), h.env);
  const payload = await response.json();
  return { status: response.status, headers: response.headers, payload };
}

async function token(h, overrides = {}) {
  const result = await request(h, '/api/enquiry-token', { headers: overrides });
  assert.equal(result.status, 200, JSON.stringify(result.payload));
  assert.equal(result.payload.ok, true);
  assert.match(result.payload.token, /^[a-f0-9-]{36}$/i);
  return result.payload.token;
}

function form({ formToken, submissionId = randomUUID(), fields = {}, attachment } = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...BASE_FIELDS, ...fields })) {
    if (value !== null) data.set(key, value);
  }
  data.set('submissionId', submissionId);
  if (formToken !== undefined) data.set('formToken', formToken);
  if (attachment) data.set('attachment', attachment);
  return data;
}

async function submit(h, options = {}) {
  return request(h, '/api/enquiries', { method: 'POST', body: form(options), headers: options.headers });
}

function assertEmpty(h) {
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiries').count, 0);
  assert.equal(h.BUCKET.objects.size, 0);
}

function assertStoredAttachment(h, enquiry, expectedBytes = new TextEncoder().encode(DRAWING)) {
  assert.ok(enquiry.attachment_key, 'The persisted lead must reference its attachment');
  const object = h.BUCKET.objects.get(enquiry.attachment_key);
  assert.ok(object, 'A receipt must never point to a deleted attachment');
  assert.deepEqual(object.bytes, expectedBytes);
  assert.equal(object.options.httpMetadata.contentType, 'application/octet-stream');
  assert.equal(object.options.httpMetadata.contentDisposition, 'attachment');
  assert.equal(object.options.customMetadata.enquiry, enquiry.reference);
}

function barrier(t, parties) {
  let arrived = 0, released = false, resolve, reject;
  const gate = new Promise((yes, no) => { resolve = yes; reject = no; });
  const timeout = setTimeout(() => reject(new Error(`Concurrency barrier timed out: ${arrived}/${parties} requests arrived`)), 5000);
  t.after(() => { clearTimeout(timeout); resolve(); });
  return async () => {
    if (released) return;
    arrived += 1;
    if (arrived === parties) { released = true; clearTimeout(timeout); resolve(); }
    await gate;
  };
}

test('issues an expiring token from the real schema and enforces the initial review interval', async t => {
  const h = fixture(t);
  const issued = await request(h, '/api/enquiry-token');
  assert.equal(issued.status, 200);
  assert.equal(issued.payload.expiresAt, START + CHALLENGE_LIFETIME);
  assert.match(issued.headers.get('cache-control'), /no-store/);
  assert.equal(issued.headers.get('x-content-type-options'), 'nosniff');
  const stored = h.DB.row('SELECT * FROM enquiry_challenges WHERE id = ?', issued.payload.token);
  assert.equal(stored.used, 0);
  assert.equal(stored.created_at, START);
  const early = await submit(h, { formToken: issued.payload.token });
  assert.equal(early.status, 400);
  assertEmpty(h);
  assert.equal(h.DB.row('SELECT used FROM enquiry_challenges WHERE id = ?', issued.payload.token).used, 0);
  h.advance(MIN_FORM_AGE + 1);
  assert.equal((await submit(h, { formToken: issued.payload.token })).status, 201);
});

test('confirms a lead only after its exact fields and attachment bytes are durably stored', async t => {
  const h = fixture(t), nonce = await token(h), submissionId = randomUUID();
  h.advance(MIN_FORM_AGE + 1);
  const result = await submit(h, { formToken: nonce, submissionId, attachment: drawing() });
  assert.equal(result.status, 201, JSON.stringify(result.payload));
  assert.equal(result.payload.ok, true);
  assert.match(result.payload.enquiryId, /^RAN-20261121-[A-F0-9]{8}$/);
  const records = h.DB.rows('SELECT * FROM enquiries');
  assert.equal(records.length, 1);
  const saved = records[0];
  assert.equal(saved.request_key, submissionId);
  assert.notEqual(saved.request_key, nonce, 'Submission identity must be independent of the short-lived nonce');
  assert.equal(saved.reference, result.payload.enquiryId);
  for (const [column, field] of Object.entries({ full_name: 'fullName', company: 'company', phone: 'phone', email: 'email', requirement: 'requirement', location: 'location', quantity: 'quantity', message: 'message' })) assert.equal(saved[column], BASE_FIELDS[field].trim());
  assert.match(saved.payload_hash, /^[a-f0-9]{64}$/);
  assert.equal(saved.attachment_name, 'control-drawing.pdf');
  assert.equal(saved.attachment_size, new TextEncoder().encode(DRAWING).length);
  assertStoredAttachment(h, saved);
  assert.equal(h.DB.row('SELECT used FROM enquiry_challenges WHERE id = ?', nonce).used, 1);
});

test('replays one receipt across fresh nonces, deleted challenges, expiry and next-day client rotation', async t => {
  const h = fixture(t), nonce = await token(h), submissionId = randomUUID();
  h.advance(MIN_FORM_AGE + 1);
  const initial = await submit(h, { formToken: nonce, submissionId, attachment: drawing() });
  assert.equal(initial.status, 201);
  const freshNonce = await token(h);
  const replay = await submit(h, { formToken: freshNonce, submissionId, attachment: drawing() });
  assert.equal(replay.status, 200);
  assert.equal(replay.payload.enquiryId, initial.payload.enquiryId);
  assert.equal(h.DB.row('SELECT used FROM enquiry_challenges WHERE id = ?', freshNonce).used, 0);
  h.advance(24 * HOUR);
  await token(h); // Real token issuance performs expired-challenge cleanup.
  assert.equal(h.DB.row('SELECT id FROM enquiry_challenges WHERE id = ?', nonce), null);
  const late = await submit(h, { formToken: nonce, submissionId, attachment: drawing(), headers: { 'CF-Connecting-IP': '198.51.100.9' } });
  assert.equal(late.status, 200);
  assert.equal(late.payload.enquiryId, initial.payload.enquiryId);
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiries').count, 1);
  assert.equal(h.BUCKET.puts.length, 1, 'Receipt replay must not upload or create a second lead');
  assertStoredAttachment(h, h.DB.row('SELECT * FROM enquiries'));
});

test('rejects changed details and same-name same-size changed drawing bytes under an existing receipt', async t => {
  const h = fixture(t), nonce = await token(h), submissionId = randomUUID();
  h.advance(MIN_FORM_AGE + 1);
  const original = await submit(h, { formToken: nonce, submissionId, attachment: drawing('AAAA') });
  assert.equal(original.status, 201);
  for (const update of [{ fields: { message: 'These are different requirements that must not be falsely acknowledged.' }, attachment: drawing('AAAA') }, { attachment: drawing('BBBB') }]) {
    const result = await submit(h, { formToken: nonce, submissionId, ...update });
    assert.equal(result.status, 409);
    assert.equal(result.payload.ok, false);
    assert.equal(result.payload.code, 'ALREADY_RECEIVED_CHANGED');
    assert.ok(result.payload.message.includes(original.payload.enquiryId));
  }
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiries').count, 1);
  assert.equal(h.BUCKET.puts.length, 1);
  assertStoredAttachment(h, h.DB.row('SELECT * FROM enquiries'), new TextEncoder().encode('AAAA'));
});

test('concurrent identical retries with different nonces create one lead and retain only its winning attachment', async t => {
  const h = fixture(t), nonces = [await token(h), await token(h)], submissionId = randomUUID();
  h.advance(MIN_FORM_AGE + 1);
  h.BUCKET.afterPut = barrier(t, 2); // Both uploads exist before either transaction can win.
  const results = await Promise.all(nonces.map(nonce => submit(h, { formToken: nonce, submissionId, attachment: drawing() })));
  assert.deepEqual(results.map(result => result.status).sort(), [200, 201]);
  assert.equal(new Set(results.map(result => result.payload.enquiryId)).size, 1);
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiries').count, 1);
  assert.equal(h.DB.row('SELECT SUM(used) AS count FROM enquiry_challenges').count, 1);
  assert.equal(h.BUCKET.puts.length, 2);
  assert.equal(h.BUCKET.objects.size, 1);
  assertStoredAttachment(h, h.DB.row('SELECT * FROM enquiries'));
});

test('concurrent different payloads cannot both receive success for one submission identity', async t => {
  const h = fixture(t), nonces = [await token(h), await token(h)], submissionId = randomUUID();
  h.advance(MIN_FORM_AGE + 1);
  h.BUCKET.afterPut = barrier(t, 2);
  const results = await Promise.all(nonces.map((nonce, index) => submit(h, { formToken: nonce, submissionId, fields: { message: `Synthetic requirement variant ${index}, deliberately different.` }, attachment: drawing(index ? 'BBBB' : 'AAAA') })));
  assert.deepEqual(results.map(result => result.status).sort(), [201, 409]);
  assert.equal(results.find(result => result.status === 409).payload.code, 'ALREADY_RECEIVED_CHANGED');
  const saved = h.DB.row('SELECT * FROM enquiries');
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiries').count, 1);
  assert.equal(h.BUCKET.objects.size, 1);
  assertStoredAttachment(h, saved, new TextEncoder().encode(saved.message.includes('variant 0') ? 'AAAA' : 'BBBB'));
});

test('refuses cross-origin requests even when one origin-related header is spoofed, and never exposes leads by GET', async t => {
  const h = fixture(t), nonce = await token(h);
  h.advance(MIN_FORM_AGE + 1);
  for (const spoof of [{ Origin: 'https://foreign.example.invalid', 'Sec-Fetch-Site': 'same-origin' }, { Origin: ORIGIN, 'Sec-Fetch-Site': 'cross-site' }, { Origin: null, 'Sec-Fetch-Site': 'cross-site' }]) {
    assert.equal((await submit(h, { formToken: nonce, headers: spoof })).status, 403);
    assert.equal((await request(h, '/api/enquiry-token', { headers: spoof })).status, 403);
  }
  assertEmpty(h);
  const saved = await submit(h, { formToken: nonce });
  assert.equal(saved.status, 201);
  for (const [path, method, expectedStatus] of [['/api/enquiries', 'GET', 405], ['/api/enquiry-token', 'POST', 405], ['/api/enquiries/private-record', 'GET', 404]]) {
    const result = await request(h, path, { method });
    assert.equal(result.status, expectedStatus);
    assert.equal(result.payload.ok, false);
    assert.ok(!JSON.stringify(result.payload).includes(BASE_FIELDS.email));
    assert.ok(!JSON.stringify(result.payload).includes(saved.payload.enquiryId));
  }
});

test('honeypot, invalid details, missing consent and invalid attachment do not consume the nonce or save data', async t => {
  const h = fixture(t), nonce = await token(h);
  h.advance(MIN_FORM_AGE + 1);
  const cases = [
    { fields: { website: 'automated-spam.example.invalid' } },
    { fields: { email: 'invalid' } },
    { fields: { phone: '123' } },
    { fields: { consent: null } },
    { fields: { message: 'short' } },
    { fields: { fullName: 'Name\u0000control' } },
    { attachment: drawing('Executable content', 'file.exe') },
  ];
  for (const invalid of cases) {
    const result = await submit(h, { formToken: nonce, ...invalid });
    assert.equal(result.status, 400, JSON.stringify(result.payload));
    assert.equal(result.payload.ok, false);
  }
  assertEmpty(h);
  assert.equal(h.DB.row('SELECT used FROM enquiry_challenges WHERE id = ?', nonce).used, 0);
  assert.equal((await submit(h, { formToken: nonce })).status, 201, 'Correcting validation errors must permit a legitimate retry');
});

test('rejects missing, foreign and expired sessions but does not confuse them with a received lead', async t => {
  const h = fixture(t), nonce = await token(h);
  h.advance(MIN_FORM_AGE + 1);
  for (const options of [{}, { formToken: randomUUID() }, { formToken: nonce, headers: { 'CF-Connecting-IP': '192.0.2.99' } }]) {
    const result = await submit(h, options);
    assert.equal(result.status, 409);
    assert.equal(result.payload.code, 'SESSION_EXPIRED');
  }
  h.advance(CHALLENGE_LIFETIME);
  const expired = await submit(h, { formToken: nonce });
  assert.equal(expired.status, 409);
  assert.equal(expired.payload.code, 'SESSION_EXPIRED');
  assertEmpty(h);
});

test('a consumed nonce cannot create a second lead under a new submission identity', async t => {
  const h = fixture(t), nonce = await token(h);
  h.advance(MIN_FORM_AGE + 1);
  assert.equal((await submit(h, { formToken: nonce })).status, 201);
  const repeatedNonce = await submit(h, { formToken: nonce });
  assert.equal(repeatedNonce.status, 409);
  assert.equal(repeatedNonce.payload.code, 'SESSION_EXPIRED');
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiries').count, 1);
});

test('token quota holds when 35 requests all observe the same stale preflight count', async t => {
  const h = fixture(t), waitForAllReads = barrier(t, 35);
  h.DB.afterFirst = ({ sql }) => /SELECT\s+COUNT\(\*\).*FROM\s+enquiry_challenges/i.test(sql) ? waitForAllReads() : undefined;
  const results = await Promise.all(Array.from({ length: 35 }, () => request(h, '/api/enquiry-token')));
  assert.equal(results.filter(result => result.status === 200).length, 30);
  assert.equal(results.filter(result => result.status === 429).length, 5);
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiry_challenges').count, 30);
  for (const result of results.filter(item => item.status === 429)) assert.ok(Number(result.headers.get('retry-after')) > 0);
});

test('submission quota remains five under concurrent stale-count races and rejected attempts leave nonces reusable', async t => {
  const h = fixture(t), nonces = [];
  for (let index = 0; index < 8; index += 1) nonces.push(await token(h));
  h.advance(MIN_FORM_AGE + 1);
  const waitForAllReads = barrier(t, nonces.length);
  h.DB.afterFirst = ({ sql }) => /SELECT\s+COUNT\(\*\).*FROM\s+enquiries\s+WHERE\s+client_hash/i.test(sql) ? waitForAllReads() : undefined;
  const results = await Promise.all(nonces.map(formToken => submit(h, { formToken, attachment: drawing() })));
  assert.equal(results.filter(result => result.status === 201).length, 5);
  assert.equal(results.filter(result => result.status === 429).length, 3);
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiries').count, 5);
  assert.equal(h.DB.row('SELECT SUM(used) AS count FROM enquiry_challenges').count, 5);
  assert.equal(h.BUCKET.objects.size, 5, 'Known quota rejections should discard only their unused attempt objects');
  for (const saved of h.DB.rows('SELECT * FROM enquiries')) assertStoredAttachment(h, saved);
  for (let index = 0; index < results.length; index += 1) if (results[index].status === 429) assert.equal(h.DB.row('SELECT used FROM enquiry_challenges WHERE id = ?', nonces[index]).used, 0);
});

test('a committed D1 transaction with a lost acknowledgement retains the attachment and returns the same receipt', async t => {
  const h = fixture(t), nonce = await token(h), submissionId = randomUUID();
  h.advance(MIN_FORM_AGE + 1);
  h.DB.failAfterNextEnquiryCommit();
  const initial = await submit(h, { formToken: nonce, submissionId, attachment: drawing() });
  assert.equal(h.DB.injectedAcknowledgementFailures, 1);
  assert.equal(initial.status, 200, 'A readable committed record should reconcile the uncertain acknowledgement');
  assert.equal(initial.payload.ok, true);
  const saved = h.DB.row('SELECT * FROM enquiries');
  assert.equal(initial.payload.enquiryId, saved.reference);
  assertStoredAttachment(h, saved);
  assert.equal(h.BUCKET.deletes.length, 0, 'The winning file must never be removed during acknowledgement recovery');
  const retry = await submit(h, { formToken: await token(h), submissionId, attachment: drawing() });
  assert.equal(retry.status, 200);
  assert.equal(retry.payload.enquiryId, initial.payload.enquiryId);
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiries').count, 1);
  assert.equal(h.BUCKET.puts.length, 1);
});

test('an unresolved acknowledgement returns no false success, preserves committed bytes, and recovers on retry', async t => {
  const h = fixture(t), nonce = await token(h), submissionId = randomUUID();
  t.mock.method(console, 'error', () => {});
  h.advance(MIN_FORM_AGE + 1);
  h.DB.failAfterNextEnquiryCommit({ failReconciliationRead: true });
  const uncertain = await submit(h, { formToken: nonce, submissionId, attachment: drawing() });
  assert.equal(uncertain.status, 503);
  assert.equal(uncertain.payload.ok, false);
  assert.equal(uncertain.payload.enquiryId, undefined);
  const saved = h.DB.row('SELECT * FROM enquiries');
  assertStoredAttachment(h, saved);
  assert.equal(h.BUCKET.deletes.length, 0);
  const retry = await submit(h, { formToken: nonce, submissionId, attachment: drawing() });
  assert.equal(retry.status, 200);
  assert.equal(retry.payload.enquiryId, saved.reference);
  assert.equal(h.DB.row('SELECT COUNT(*) AS count FROM enquiries').count, 1);
  assert.equal(h.BUCKET.objects.size, 1);
});

test('an attachment-storage failure never confirms a lead or permanently consumes its nonce', async t => {
  const h = fixture(t), nonce = await token(h), submissionId = randomUUID();
  t.mock.method(console, 'error', () => {});
  h.advance(MIN_FORM_AGE + 1);
  h.BUCKET.failNextPut = true;
  const failed = await submit(h, { formToken: nonce, submissionId, attachment: drawing() });
  assert.equal(failed.status, 503);
  assert.equal(failed.payload.ok, false);
  assertEmpty(h);
  assert.equal(h.DB.row('SELECT used FROM enquiry_challenges WHERE id = ?', nonce).used, 0);
  const retry = await submit(h, { formToken: nonce, submissionId, attachment: drawing() });
  assert.equal(retry.status, 201);
  assertStoredAttachment(h, h.DB.row('SELECT * FROM enquiries'));
});

test('the actual endpoint rejects unsupported bodies, oversized attachments and oversized streamed requests', async t => {
  const h = fixture(t), nonce = await token(h);
  h.advance(MIN_FORM_AGE + 1);
  const unsupported = await request(h, '/api/enquiries', { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
  assert.equal(unsupported.status, 415);
  const oversized = await submit(h, { formToken: nonce, attachment: new File([new Uint8Array(MAX_ATTACHMENT_BYTES + 1)], 'too-large.pdf') });
  assert.equal(oversized.status, 413);
  let sent = 0;
  const stream = new ReadableStream({ pull(controller) { if (sent > MAX_BODY_BYTES) { controller.close(); return; } const chunk = new Uint8Array(256 * 1024); sent += chunk.length; controller.enqueue(chunk); } });
  const streamed = await request(h, '/api/enquiries', { method: 'POST', body: stream, duplex: 'half', headers: { 'Content-Type': 'multipart/form-data; boundary=synthetic-boundary' } });
  assert.equal(streamed.status, 413, 'Actual bytes must be bounded even without a Content-Length header');
  assertEmpty(h);
  assert.equal(h.DB.row('SELECT used FROM enquiry_challenges WHERE id = ?', nonce).used, 0);
});
