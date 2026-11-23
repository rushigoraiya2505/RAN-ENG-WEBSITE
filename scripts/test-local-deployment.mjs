// Integration smoke test for the compiled Cloudflare deployment.
// Uses disposable local D1/R2 storage. Never contacts the deployed website.
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { Miniflare, Log, LogLevel } from 'miniflare';

const root = fileURLToPath(new URL('../', import.meta.url));
const configPath = path.join(root, 'dist/server/wrangler.json');
let config;
try {
  config = JSON.parse(await readFile(configPath, 'utf8'));
} catch (error) {
  if (error.code === 'ENOENT') throw new Error('Build the website first with npm run build, then run npm run test:deployment.');
  throw error;
}

assert.equal(config.assets?.binding, 'ASSETS', 'The compiled Worker must retain the ASSETS binding.');
assert.equal(config.assets?.run_worker_first, true, 'The enquiry API must run before static asset handling.');
assert.equal(config.assets?.not_found_handling, 'none', 'Unknown routes must not silently serve the homepage.');
assert.ok(config.d1_databases?.some(binding => binding.binding === 'DB'), 'Missing DB binding.');
assert.ok(config.r2_buckets?.some(binding => binding.binding === 'BUCKET'), 'Missing BUCKET binding.');

const temporary = await mkdtemp(path.join(tmpdir(), 'ran-deployment-check-'));
const origin = 'http://ran-local.test';
let runtime;
try {
  runtime = new Miniflare({
    name: config.name,
    host: '127.0.0.1',
    port: 0,
    cf: false,
    log: new Log(LogLevel.ERROR),
    compatibilityDate: config.compatibility_date,
    compatibilityFlags: config.compatibility_flags,
    modules: true,
    scriptPath: path.resolve(path.dirname(configPath), config.main),
    modulesRoot: path.dirname(configPath),
    modulesRules: config.rules?.map(rule => ({ type: rule.type, include: rule.globs, ...(rule.fallthrough === undefined ? {} : { fallthrough: rule.fallthrough }) })),
    d1Databases: ['DB'],
    r2Buckets: ['BUCKET'],
    d1Persist: path.join(temporary, 'd1'),
    r2Persist: path.join(temporary, 'r2'),
    assets: {
      directory: path.resolve(path.dirname(configPath), config.assets.directory),
      binding: 'ASSETS',
      routerConfig: { invoke_user_worker_ahead_of_assets: true, has_user_worker: true },
      assetConfig: {
        html_handling: config.assets.html_handling,
        not_found_handling: config.assets.not_found_handling,
      },
    },
    outboundService: async () => new Response('External requests are disabled in this local test.', { status: 503 }),
  });
  const database = await runtime.getD1Database('DB');
  const bucket = await runtime.getR2Bucket('BUCKET');
  const migrations = (await readdir(path.join(root, 'drizzle'))).filter(file => file.endsWith('.sql')).sort();
  assert.ok(migrations.length, 'No database migrations were packaged.');
  for (const migration of migrations) {
    const sql = await readFile(path.join(root, 'drizzle', migration), 'utf8');
    for (const statement of sql.split('--> statement-breakpoint')) {
      if (statement.trim()) await database.prepare(statement).run();
    }
  }

  async function request(route, options = {}) {
    const outgoing = new Request(`${origin}${route}`, {
      ...options,
      headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', ...options.headers },
    });
    // Forward serialized HTTP bytes so Node and Miniflare need not share the
    // same FormData implementation. The Worker receives real multipart data.
    return runtime.dispatchFetch(outgoing.url, {
      method: outgoing.method,
      headers: Object.fromEntries(outgoing.headers),
      ...(outgoing.body ? { body: await outgoing.arrayBuffer() } : {}),
    });
  }
  for (const route of ['/', '/about', '/projects', '/contact']) {
    const response = await request(route, { headers: { Accept: 'text/html' } });
    assert.equal(response.status, 200, `The built ${route} route must load.`);
    assert.match(response.headers.get('content-type') || '', /text\/html/);
    assert.match(await response.text(), /RAN ENGINEERS/i);
  }
  const removedPage = await request('/image-credits', { headers: { Accept: 'text/html' } });
  assert.equal(removedPage.status, 404, 'The removed image credits page must stay removed.');
  await removedPage.text();

  const issued = await request('/api/enquiry-token');
  assert.equal(issued.status, 200);
  const challenge = await issued.json();
  assert.equal(challenge.ok, true);
  assert.ok(challenge.token);
  // Respect the real minimum form age; do not alter the production Worker.
  await delay(1600);

  const submissionId = randomUUID();
  const drawing = '0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF\n';
  function submission() {
    const form = new FormData();
    for (const [name, value] of Object.entries({
      fullName: 'Local Deployment Verification',
      company: 'Synthetic test only',
      phone: '+12025550123',
      email: 'deployment-check@example.invalid',
      requirement: 'Local deployment verification',
      location: 'Disposable local runtime',
      quantity: 'One synthetic enquiry',
      message: 'Synthetic local verification; this is never submitted to the live service.',
      consent: 'agreed',
      website: '',
      formToken: challenge.token,
      submissionId,
    })) form.set(name, value);
    form.set('attachment', new File([drawing], 'deployment-check.dxf', { type: 'application/dxf' }));
    return form;
  }

  const sent = await request('/api/enquiries', { method: 'POST', body: submission() });
  const receipt = await sent.json();
  assert.equal(sent.status, 201, JSON.stringify(receipt));
  assert.equal(receipt.ok, true);
  assert.match(receipt.enquiryId, /^RAN-\d{8}-[A-F0-9]{8}$/);
  const saved = await database.prepare('SELECT * FROM enquiries WHERE request_key = ?').bind(submissionId).first();
  assert.equal(saved.reference, receipt.enquiryId);
  assert.equal(saved.email, 'deployment-check@example.invalid');
  assert.match(saved.payload_hash, /^[a-f0-9]{64}$/);
  assert.equal(saved.attachment_name, 'deployment-check.dxf');
  const storedFile = await bucket.get(saved.attachment_key);
  assert.ok(storedFile, 'The saved enquiry must reference an existing R2 object.');
  assert.equal(await storedFile.text(), drawing);

  const repeated = await request('/api/enquiries', { method: 'POST', body: submission() });
  assert.equal(repeated.status, 200);
  assert.equal((await repeated.json()).enquiryId, receipt.enquiryId);
  assert.equal((await database.prepare('SELECT COUNT(*) AS total FROM enquiries').first()).total, 1);
  assert.equal((await bucket.list()).objects.length, 1);
  const privateRecords = await request('/api/enquiries');
  assert.equal(privateRecords.status, 405);
  const privateReply = await privateRecords.text();
  assert.ok(!privateReply.includes(receipt.enquiryId));
  assert.ok(!privateReply.includes('deployment-check@example.invalid'));

  console.log('PASS: built page routes, removed credits route, both migrations, local D1 enquiry receipt, R2 attachment, idempotent replay and private records.');
  console.log('Only disposable local storage was used. No production data or Cloudflare account was accessed.');
} finally {
  try { await runtime?.dispose(); }
  finally { await rm(temporary, { recursive: true, force: true }); }
}
