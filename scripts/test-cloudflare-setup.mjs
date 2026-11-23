import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { ensureLocalConfig, projectRoot } from './cloudflare/config.mjs';
import { setupCloudflare } from './cloudflare/setup.mjs';

const env = { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_API_TOKEN: 'test-only-not-a-real-token' };
const database = { name: 'ran-engineers-enquiries', uuid: 'd3c26484-6a8d-46db-b92b-7a3052a72fe0' };
const bucket = { name: 'ran-engineers-enquiry-attachments' };
const ok = result => new Response(JSON.stringify({ success: true, result }), { status: 200 });
const fail = (status, message) => new Response(JSON.stringify({ success: false, errors: [{ code: 1000, message }] }), { status });

async function temporaryRoot(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ran-cloudflare-test-'));
  await fs.copyFile(path.join(projectRoot, 'wrangler.template.json'), path.join(root, 'wrangler.template.json'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}

test('local setup needs no credentials, writes no resource IDs, and preserves a prepared config', async t => {
  const root = await temporaryRoot(t);
  const filename = await ensureLocalConfig(root);
  const initial = JSON.parse(await fs.readFile(filename, 'utf8'));
  assert.equal(initial.d1_databases[0].database_id, undefined);
  assert.equal(initial.account_id, undefined);
  initial.d1_databases[0].database_id = database.uuid;
  await fs.writeFile(filename, JSON.stringify(initial));
  assert.equal(await ensureLocalConfig(root), filename);
  assert.equal(JSON.parse(await fs.readFile(filename, 'utf8')).d1_databases[0].database_id, database.uuid);
});

test('first remote setup provisions both resources and repeat setup makes no creation calls', async t => {
  const root = await temporaryRoot(t);
  let hasDatabase = false;
  let hasBucket = false;
  const calls = [];
  const logs = [];
  const fetchImpl = async (url, options) => {
    assert.equal(options.headers.Authorization, `Bearer ${env.CLOUDFLARE_API_TOKEN}`);
    const pathname = new URL(url).pathname;
    calls.push({ method: options.method, pathname });
    if (pathname.endsWith('/d1/database')) {
      if (options.method === 'GET') return ok(hasDatabase ? [database] : []);
      assert.equal(options.method, 'POST');
      hasDatabase = true;
      return ok(database);
    }
    assert.ok(pathname.endsWith('/r2/buckets'));
    if (options.method === 'GET') return ok({ buckets: hasBucket ? [bucket] : [] });
    assert.equal(options.method, 'POST');
    hasBucket = true;
    return ok(bucket);
  };
  const first = await setupCloudflare({ root, env, fetchImpl, log: value => logs.push(value) });
  assert.equal(first.databaseCreated, true);
  assert.equal(first.bucketCreated, true);
  const second = await setupCloudflare({ root, env, fetchImpl, log: value => logs.push(value) });
  assert.equal(second.databaseCreated, false);
  assert.equal(second.bucketCreated, false);
  assert.equal(calls.filter(call => call.method === 'POST').length, 2);
  assert.equal(calls.filter(call => call.method === 'DELETE').length, 0);
  const output = await fs.readFile(first.configPath, 'utf8');
  const config = JSON.parse(output);
  assert.equal(config.account_id, env.CLOUDFLARE_ACCOUNT_ID);
  assert.equal(config.d1_databases[0].database_id, database.uuid);
  assert.equal(config.d1_databases[0].migrations_dir, 'drizzle');
  assert.equal(config.r2_buckets[0].bucket_name, bucket.name);
  assert.equal(config.workers_dev, true);
  assert.equal(config.routes, undefined);
  assert.equal(output.includes(env.CLOUDFLARE_API_TOKEN), false);
  assert.equal(logs.join('\n').includes(env.CLOUDFLARE_API_TOKEN), false);
});

test('disabled R2 fails before resource creation and does not replace local configuration', async t => {
  const root = await temporaryRoot(t);
  const filename = await ensureLocalConfig(root);
  const before = await fs.readFile(filename, 'utf8');
  const calls = [];
  await assert.rejects(setupCloudflare({ root, env, log: () => {}, fetchImpl: async (url, options) => {
    calls.push(options.method);
    return url.includes('/d1/database') ? ok([]) : fail(403, 'R2 not enabled');
  } }), /Enable R2 Object Storage/);
  assert.deepEqual(calls, ['GET', 'GET']);
  assert.equal(await fs.readFile(filename, 'utf8'), before);
});

test('a creation race is reconciled by reading the exact resource, without repeating POST', async t => {
  const root = await temporaryRoot(t);
  let createdElsewhere = false;
  let posts = 0;
  const result = await setupCloudflare({ root, env, log: () => {}, fetchImpl: async (url, options) => {
    if (url.includes('/r2/buckets')) return ok({ buckets: [bucket] });
    if (options.method === 'GET') return ok(createdElsewhere ? [database] : []);
    posts += 1;
    createdElsewhere = true;
    return fail(409, 'Database already exists');
  } });
  assert.equal(result.databaseId, database.uuid);
  assert.equal(result.databaseCreated, false);
  assert.equal(posts, 1);
});

test('R2 failure after D1 creation preserves the resource and retry reuses it', async t => {
  const root = await temporaryRoot(t);
  let hasDatabase = false;
  let allowBucketCreation = false;
  let databasePosts = 0;
  const fetchImpl = async (url, options) => {
    if (url.includes('/d1/database')) {
      if (options.method === 'GET') return ok(hasDatabase ? [database] : []);
      hasDatabase = true;
      databasePosts += 1;
      return ok(database);
    }
    if (options.method === 'GET') return ok({ buckets: [] });
    return allowBucketCreation ? ok(bucket) : fail(403, 'R2 creation is disabled');
  };
  await assert.rejects(setupCloudflare({ root, env, fetchImpl, log: () => {} }), /D1 database is preserved/);
  allowBucketCreation = true;
  const result = await setupCloudflare({ root, env, fetchImpl, log: () => {} });
  assert.equal(result.databaseCreated, false);
  assert.equal(result.bucketCreated, true);
  assert.equal(databasePosts, 1);
});

test('missing credentials and invalid resource names fail before API calls', async t => {
  const root = await temporaryRoot(t);
  const fetchImpl = () => { throw new Error('The network must not be called.'); };
  await assert.rejects(setupCloudflare({ root, env: {}, fetchImpl }), /CLOUDFLARE_ACCOUNT_ID/);
  await assert.rejects(setupCloudflare({ root, env: { ...env, CLOUDFLARE_API_TOKEN: '' }, fetchImpl }), /CLOUDFLARE_API_TOKEN/);
  await assert.rejects(setupCloudflare({ root, env: { ...env, RAN_BUCKET_NAME: '../invalid' }, fetchImpl }), /RAN_BUCKET_NAME/);
});

test('pagination and exact name matching do not bind similarly named resources', async t => {
  const root = await temporaryRoot(t);
  let calls = 0;
  const result = await setupCloudflare({ root, env: { ...env, RAN_WORKER_NAME: '', RAN_DATABASE_NAME: '', RAN_BUCKET_NAME: '' }, log: () => {}, fetchImpl: async (rawUrl, options) => {
    calls += 1;
    assert.equal(options.method, 'GET');
    const url = new URL(rawUrl);
    if (url.pathname.endsWith('/d1/database')) {
      if (url.searchParams.get('page') === '1') {
        return ok(Array.from({ length: 100 }, (_, index) => ({ name: `${database.name}-archive-${index}`, uuid: database.uuid })));
      }
      return ok([database]);
    }
    if (!url.searchParams.has('cursor')) {
      return new Response(JSON.stringify({ success: true, result: { buckets: [{ name: `${bucket.name}-archive` }] }, result_info: { cursor: 'next-page' } }), { status: 200 });
    }
    assert.equal(url.searchParams.get('cursor'), 'next-page');
    return ok({ buckets: [bucket] });
  } });
  assert.equal(calls, 4);
  assert.equal(result.workerName, 'ran-engineers');
  assert.equal(result.databaseName, database.name);
  assert.equal(result.bucketName, bucket.name);
});

test('upstream error text cannot expose the API token', async t => {
  const root = await temporaryRoot(t);
  await assert.rejects(setupCloudflare({ root, env, log: () => {}, fetchImpl: async () => fail(403, `invalid ${env.CLOUDFLARE_API_TOKEN}`) }), error => {
    assert.equal(error.message.includes(env.CLOUDFLARE_API_TOKEN), false);
    assert.ok(error.message.includes('[redacted]'));
    return true;
  });
});
