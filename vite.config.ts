import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { ensureLocalConfig } from './scripts/cloudflare/config.mjs';

export default defineConfig(async ({ mode, command }) => {
  if (mode === 'prerender') return { plugins: [react()], build: { target: 'es2022' } };
  const { cloudflare } = await import('@cloudflare/vite-plugin');
  return {
    server: { host: '127.0.0.1' },
    plugins: [react(), tailwindcss(), cloudflare({
      configPath: await ensureLocalConfig(process.cwd()),
      viteEnvironment: { name: 'server' }, inspectorPort: false,
      config: { assets: { not_found_handling: command === 'serve' ? 'single-page-application' : 'none' } },
    })],
    build: { target: 'es2022' },
  };
});
