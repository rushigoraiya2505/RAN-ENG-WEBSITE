import fs from 'node:fs/promises';
import path from 'node:path';
import { allRoutes, metadata, render } from '../.prerender/entry-server.js';

// The maintained worker build serves this directory through its ASSETS binding.
const root = path.resolve('dist/client');
const template = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const seoBlock = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
if (!seoBlock.test(template)) throw new Error('The HTML template is missing its SEO metadata block.');
if (!template.includes('<div id="root"></div>')) throw new Error('The HTML template is missing its React root.');
if (new Set(allRoutes).size !== allRoutes.length) throw new Error('The route list contains duplicate paths.');

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
function head(meta) {
  return `<!-- seo:start -->\n    <title>${escape(meta.title)}</title>\n    <link rel="canonical" href="${escape(meta.canonical)}" />\n${meta.tags.map(tag => `    <meta ${tag.attribute}="${escape(tag.key)}" content="${escape(tag.content)}" />`).join('\n')}\n    <!-- seo:end -->`;
}
function prerender(route) {
  const meta = metadata(route);
  const body = render(route);
  return template.replace(seoBlock, () => head(meta)).replace('<div id="root"></div>', () => `<div id="root" data-route="${escape(route)}">${body}</div>`);
}

for (const route of allRoutes) {
  const dir = path.join(root, route.slice(1));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), prerender(route));
}

// The worker preserves HTTP 404 when serving this document for unknown HTML routes.
await fs.writeFile(path.join(root, '404.html'), prerender('/404'));
const urls = allRoutes.filter(route => !metadata(route).noindex).map(route => `  <url><loc>${escape(metadata(route).canonical)}</loc></url>`).join('\n');
await fs.writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await fs.writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${metadata('/').canonical}sitemap.xml\n`);

// Routing stays with the Worker; Cloudflare serves the matching client assets.
console.log(`Prerendered ${allRoutes.length} routes, one noindex 404 page, matching metadata, structured data and sitemap.`);
