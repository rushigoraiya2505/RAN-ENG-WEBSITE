import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupCloudflare } from './setup.mjs';
import { validateBuild } from './validate-build.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const flags = process.argv.slice(2);
if (flags.length > 1 || flags.some(flag => !['--build-only', '--prepared'].includes(flag))) {
  console.error('Usage: npm run deploy:cloudflare, npm run build:cloudflare, or npm run deploy:prepared');
  process.exit(1);
}
function runNode(file, args) {
  const result = spawnSync(process.execPath, [file, ...args], { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Command failed: ${path.basename(file)} ${args.join(' ')}`);
}
function build() {
  if (!process.env.npm_execpath) throw new Error('Run this command through npm using the commands in README.md.');
  runNode(process.env.npm_execpath, ['run', 'build']);
}

// Do not run initial CREATE TABLE migrations over an imported database that has
// no Wrangler ledger. This check reads schema names only; it never downloads leads.
async function checkMigrationHistory(databaseId) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID.trim();
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${databaseId}/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('enquiries', 'd1_migrations')" }),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (!response.ok || !result.success || result.result?.some(query => !query.success)) {
    throw new Error(`Could not inspect D1 migration history (HTTP ${response.status}). Check D1 Edit permission.`);
  }
  const names = result.result.flatMap(query => query.results || []).map(row => row.name);
  if (names.includes('enquiries') && !names.includes('d1_migrations')) {
    throw new Error('This database already has enquiry tables but no Wrangler migration history. Follow docs/DATA-MIGRATION.md; do not apply initial migrations over an imported database.');
  }
  if (names.includes('enquiries')) {
    const historyResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${databaseId}/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: 'SELECT name FROM d1_migrations WHERE name = ?', params: ['0000_swift_hitman.sql'] }),
      signal: AbortSignal.timeout(30000),
    });
    const history = await historyResponse.json();
    if (!historyResponse.ok || !history.success || !history.result?.[0]?.success || !history.result[0].results?.length) {
      throw new Error('The existing database does not record this project’s initial migration. Follow docs/DATA-MIGRATION.md before deploying.');
    }
  }
}

try {
  if (!flags.includes('--prepared')) {
    await setupCloudflare({ root });
    build();
  }
  const { db } = await validateBuild({ root, requireCloudflare: true });
  if (flags.includes('--build-only')) {
    console.log('Cloudflare resources configured and production build ready.');
  } else {
    await checkMigrationHistory(db.database_id);
    const wrangler = path.join(root, 'node_modules/wrangler/bin/wrangler.js');
    runNode(wrangler, ['d1', 'migrations', 'apply', 'DB', '--remote', '--config', 'wrangler.generated.json']);
    runNode(wrangler, ['deploy', '--config', 'dist/server/wrangler.json']);
    console.log('Deployment finished. Open the workers.dev URL printed above and test the enquiry form before changing the company domain.');
  }
} catch (error) {
  console.error(`Deployment stopped: ${error.message}`);
  process.exitCode = 1;
}
