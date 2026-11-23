import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
export const templateFilename = 'wrangler.template.json';
export const generatedFilename = 'wrangler.generated.json';

export function validateBindings(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('The Wrangler configuration must be a JSON object.');
  }
  if (config.assets?.binding !== 'ASSETS' ||
      config.d1_databases?.length !== 1 || config.d1_databases[0]?.binding !== 'DB' ||
      config.r2_buckets?.length !== 1 || config.r2_buckets[0]?.binding !== 'BUCKET') {
    throw new Error('Keep the required ASSETS, DB and BUCKET bindings in the Wrangler configuration.');
  }
  return config;
}

export async function readTemplate(root = projectRoot) {
  const filename = path.join(root, templateFilename);
  try {
    return validateBindings(JSON.parse(await fs.readFile(filename, 'utf8')));
  } catch (error) {
    throw new Error(`Could not read ${templateFilename}: ${error.message}`);
  }
}

export async function writeGeneratedConfig(config, root = projectRoot) {
  validateBindings(config);
  const filename = path.join(root, generatedFilename);
  const temporary = `${filename}.${process.pid}.tmp`;
  try {
    await fs.writeFile(temporary, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
    await fs.rename(temporary, filename);
  } finally {
    await fs.rm(temporary, { force: true });
  }
  return filename;
}

/** Creates local-only configuration without contacting Cloudflare or inventing resource IDs. */
export async function ensureLocalConfig(root = projectRoot) {
  const filename = path.join(root, generatedFilename);
  try {
    validateBindings(JSON.parse(await fs.readFile(filename, 'utf8')));
    return filename;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Could not read ${generatedFilename}: ${error.message}`);
    }
  }
  return writeGeneratedConfig(await readTemplate(root), root);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await ensureLocalConfig();
    console.log(`${generatedFilename} is ready for local development. No cloud resources were changed.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
