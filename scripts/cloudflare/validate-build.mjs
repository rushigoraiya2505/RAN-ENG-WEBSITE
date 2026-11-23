import assert from 'node:assert/strict';
import { readFile, access, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../../', import.meta.url));
export async function validateBuild({ root = defaultRoot, requireCloudflare = false, env = process.env } = {}) {
  const config = JSON.parse(await readFile(path.join(root, 'dist/server/wrangler.json'), 'utf8'));
  const sourceConfig = JSON.parse(await readFile(path.join(root, 'wrangler.generated.json'), 'utf8'));
  assert.equal(config.name, sourceConfig.name, 'Rebuild after changing the Worker name.');
  assert.equal(config.assets?.binding, 'ASSETS', 'The static assets binding must be ASSETS.');
  assert.equal(config.assets?.run_worker_first, true, 'The enquiry API requires Worker-first routing.');
  assert.equal(config.assets?.not_found_handling, 'none', 'Production must preserve real 404 responses.');
  const assetRoot = path.resolve(root, 'dist/server', config.assets.directory);
  assert.equal(assetRoot, path.join(root, 'dist/client'), 'Client and Worker outputs must remain together.');
  const entry = path.resolve(root, 'dist/server', config.main);
  assert.ok((await stat(entry)).isFile(), 'The compiled Worker entrypoint is missing.');
  for (const name of ['index.html', 'about/index.html', 'projects/index.html', 'contact/index.html', '404.html', 'sitemap.xml']) {
    await access(path.join(assetRoot, name));
  }
  const db = config.d1_databases?.find(value => value.binding === 'DB');
  const bucket = config.r2_buckets?.find(value => value.binding === 'BUCKET');
  assert.ok(db && bucket, 'Both the enquiry database and attachment bucket must be bound.');
  assert.equal(db.database_name, sourceConfig.d1_databases.find(value => value.binding === 'DB').database_name);
  assert.equal(bucket.bucket_name, sourceConfig.r2_buckets.find(value => value.binding === 'BUCKET').bucket_name);
  if (requireCloudflare) {
    const accountId = (env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    assert.match(accountId, /^[a-f0-9]{32}$/i, 'Set CLOUDFLARE_ACCOUNT_ID.');
    assert.ok(env.CLOUDFLARE_API_TOKEN, 'Set CLOUDFLARE_API_TOKEN in secrets, not in source files.');
    assert.equal(sourceConfig.account_id, accountId, 'Run cf:setup for the selected Cloudflare account.');
    assert.equal(config.account_id, accountId, 'Rebuild for the selected Cloudflare account before deploying.');
    assert.match(db.database_id || '', /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i, 'Run cf:setup and rebuild with a real D1 database.');
    assert.notEqual(db.database_id, '00000000-0000-4000-8000-000000000000', 'A development placeholder cannot be deployed.');
    assert.equal(db.database_id, sourceConfig.d1_databases.find(value => value.binding === 'DB').database_id, 'Run build after cf:setup.');
  }
  return { config, sourceConfig, db, bucket, entry, assetRoot };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { config } = await validateBuild();
    console.log(`Deployment build checked: ${config.name}, Worker, client assets, DB and BUCKET.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
