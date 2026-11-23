import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { projectRoot, readTemplate, writeGeneratedConfig } from './config.mjs';

const apiBase = 'https://api.cloudflare.com/client/v4';
const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const namePattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

class CloudflareApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function resourceName(value, label, minimumLength = 1) {
  if (typeof value !== 'string' || value.length < minimumLength || !namePattern.test(value)) {
    throw new Error(`${label} must be ${minimumLength}–63 characters: lowercase letters, numbers and interior hyphens.`);
  }
  return value;
}

function mayHaveCreated(error) {
  return error instanceof CloudflareApiError &&
    (error.status === 0 || error.status === 409 || /already exists|already in use|duplicate/i.test(error.message));
}

/** Provision named resources only. No domains, routes, permissions or existing data are changed. */
export async function setupCloudflare({
  root = projectRoot,
  env = process.env,
  fetchImpl = globalThis.fetch,
  log = console.log,
} = {}) {
  const accountId = (env.CLOUDFLARE_ACCOUNT_ID || '').trim();
  const token = (env.CLOUDFLARE_API_TOKEN || '').trim();
  if (!/^[0-9a-f]{32}$/i.test(accountId)) {
    throw new Error('Set CLOUDFLARE_ACCOUNT_ID to your 32-character Cloudflare account ID. In GitHub, add it as an Actions repository secret.');
  }
  if (!token) {
    throw new Error('Set CLOUDFLARE_API_TOKEN as an Actions repository secret. Do not put its value in this repository.');
  }
  const redact = value => String(value).split(token).join('[redacted]').slice(0, 700);
  const config = await readTemplate(root);
  const workerName = resourceName((env.RAN_WORKER_NAME || config.name).trim(), 'RAN_WORKER_NAME');
  const databaseName = resourceName((env.RAN_DATABASE_NAME || config.d1_databases[0].database_name).trim(), 'RAN_DATABASE_NAME');
  const bucketName = resourceName((env.RAN_BUCKET_NAME || config.r2_buckets[0].bucket_name).trim(), 'RAN_BUCKET_NAME', 3);
  const accountPath = `/accounts/${accountId}`;

  async function request(method, endpoint, body) {
    let response;
    try {
      response = await fetchImpl(`${apiBase}${accountPath}${endpoint}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      throw new CloudflareApiError(`Cloudflare request failed: ${redact(error.message)}. Run setup again to reconcile any completed resource creation.`, 0);
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw new CloudflareApiError(`Cloudflare returned HTTP ${response.status} without a JSON response.`, response.status);
    }
    if (!response.ok || data.success !== true) {
      const details = Array.isArray(data.errors) ? data.errors.map(error => `${error.code ?? ''} ${error.message ?? ''}`.trim()).join('; ') : 'Unexpected API response';
      throw new CloudflareApiError(`Cloudflare HTTP ${response.status}: ${redact(details)}`, response.status);
    }
    return data;
  }

  async function findDatabase() {
    for (let page = 1; page <= 1000; page += 1) {
      const query = new URLSearchParams({ name: databaseName, page: String(page), per_page: '100' });
      const data = await request('GET', `/d1/database?${query}`);
      if (!Array.isArray(data.result)) throw new Error('Cloudflare returned an invalid D1 database list.');
      const matches = data.result.filter(database => database.name === databaseName);
      if (matches.length > 1) throw new Error(`More than one D1 database exactly matches ${databaseName}; resolve this in Cloudflare before setup.`);
      if (matches.length === 1) return matches[0];
      if (data.result.length < 100 || (data.result_info?.total_pages && page >= data.result_info.total_pages)) return null;
    }
    throw new Error('The D1 database search exceeded its pagination limit. Narrow the configured resource name.');
  }

  async function findBucket() {
    let cursor;
    const seen = new Set();
    for (let page = 0; page < 1000; page += 1) {
      const query = new URLSearchParams({ name_contains: bucketName, per_page: '100' });
      if (cursor) query.set('cursor', cursor);
      const data = await request('GET', `/r2/buckets?${query}`);
      if (!Array.isArray(data.result?.buckets)) throw new Error('Cloudflare returned an invalid R2 bucket list.');
      const match = data.result.buckets.find(bucket => bucket.name === bucketName);
      if (match) return match;
      cursor = data.result_info?.cursor;
      if (!cursor) return null;
      if (seen.has(cursor)) throw new Error('Cloudflare repeated an R2 pagination cursor; no resource was selected.');
      seen.add(cursor);
    }
    throw new Error('The R2 bucket search exceeded its pagination limit. Narrow the configured resource name.');
  }

  let database;
  let bucket;
  try {
    database = await findDatabase();
  } catch (error) {
    throw new Error(`D1 lookup failed. Grant Account > D1 > Edit for the selected account. ${redact(error.message)}`);
  }
  try {
    // Check R2 access before creating anything, so an inactive R2 account fails early.
    bucket = await findBucket();
  } catch (error) {
    throw new Error(`R2 lookup failed. Enable R2 Object Storage in Cloudflare and grant Account > Workers R2 Storage > Edit. ${redact(error.message)}`);
  }

  let databaseCreated = false;
  if (!database) {
    try {
      database = (await request('POST', '/d1/database', { name: databaseName })).result;
      databaseCreated = true;
    } catch (error) {
      // Reconcile a concurrent creation or a response lost after creation; never repeat the POST blindly.
      if (mayHaveCreated(error)) database = await findDatabase();
      if (!database) throw new Error(`D1 creation failed. Check D1 permissions and account limits. ${redact(error.message)}`);
    }
  }
  if (database?.name !== databaseName || !uuidPattern.test(database?.uuid || '')) {
    throw new Error('Cloudflare did not return the expected D1 name and a valid database UUID. No deployment configuration was written.');
  }
  log(`${databaseCreated ? 'Created' : 'Using'} D1 database: ${databaseName}`);

  let bucketCreated = false;
  if (!bucket) {
    try {
      bucket = (await request('POST', '/r2/buckets', { name: bucketName })).result;
      bucketCreated = true;
    } catch (error) {
      if (mayHaveCreated(error)) bucket = await findBucket();
      if (!bucket) throw new Error(`R2 creation failed. Enable R2 Object Storage and check Account > Workers R2 Storage > Edit. Any created D1 database is preserved and will be reused on retry. ${redact(error.message)}`);
    }
  }
  if (bucket?.name !== bucketName) {
    throw new Error('Cloudflare did not return the expected R2 bucket name. No deployment configuration was written.');
  }
  log(`${bucketCreated ? 'Created' : 'Using'} R2 bucket: ${bucketName}`);

  config.account_id = accountId;
  config.name = workerName;
  config.d1_databases[0].database_name = databaseName;
  config.d1_databases[0].database_id = database.uuid;
  config.r2_buckets[0].bucket_name = bucketName;
  const configPath = await writeGeneratedConfig(config, root);
  log('Cloudflare configuration is ready. Apply the database migrations, build, then deploy the Worker.');
  return { configPath, workerName, databaseName, databaseId: database.uuid, bucketName, databaseCreated, bucketCreated };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await setupCloudflare();
  } catch (error) {
    console.error(`Cloudflare setup failed: ${error.message}`);
    process.exitCode = 1;
  }
}
