# Application architecture

## Preserved website

The exported website is based on source commit `5f445b5194b6b7a18b422c874da1aa886ba2fa14`, published Site version 10. React/TypeScript pages use the existing Manrope/Inter fonts and navy, blue and orange branding. The shared `src/spacing.css` supplies the final responsive section and footer spacing.

Project order remains Kadana gantry crane, Sani lighting, Karjan 100 kW distribution panel, Karjan crane box, Pipavav panel commissioning, Machhu-II 30-metre high mast. Legacy URL and image filenames are retained for existing links; visible copy uses the corrected names. The homepage has the two-row photo gallery. The About page's removed gallery stays removed. No public Image credits route is registered.

## Build

`vite.config.ts` uses React, Tailwind and the Cloudflare Vite plugin. It reads `wrangler.generated.json`, created from `wrangler.template.json` locally or filled with real resource identifiers by `scripts/cloudflare/setup.mjs`.

`npm run build` checks TypeScript, creates the Worker/client bundles, renders route HTML through `src/entry-server.tsx`, and writes canonical metadata, structured data, sitemap, robots and a noindex 404 document using `scripts/postbuild.mjs`.

| Output | Purpose |
| --- | --- |
| `dist/client` | Prerendered route HTML, scripts, styles, fonts, images and SEO files |
| `dist/server/index.js` | Compiled Worker |
| `dist/server/wrangler.json` | Generated deployment configuration with asset and storage bindings |

## Enquiry backend

The application code in `worker/index.ts` and `worker/enquiry-validation.ts` is unchanged from the current source. It requires `DB` (D1), `BUCKET` (R2) and `ASSETS`; no additional application signing secret is required.

1. `GET /api/enquiry-token` validates request origin and issues a temporary challenge in D1.
2. The form sends multipart data to `POST /api/enquiries` with the challenge token and unique request identifier.
3. The Worker checks field lengths, consent, timing, body/attachment limits, origin, throttling and duplicate submissions.
4. An optional file is stored privately in R2. The enquiry and attachment reference are stored in a D1 transaction. A confirmed receipt is returned only after storage is reconciled.
5. Matching retries return the same receipt; changed payloads with the same identifier are rejected so an uncertain network acknowledgement cannot silently create a different enquiry.

Stored receipt does not mean an email was sent. Email delivery, CRM sync and a public administration UI are not added by this deployment package.

Requests outside the API are served through ASSETS. Unknown page routes use the existing 404 document with a 404 HTTP status.

## Deployment portability changes

- Replaced the ChatGPT Site identity and build integration with ordinary Cloudflare configuration.
- Added real-resource bootstrap, migration checks and GitHub workflows.
- Set the default canonical site URL to `https://www.ranengineers.com`.
- Retained all application source, local images, project photos, schema and backend behaviour.
- Excluded runtime database contents, stored uploads, credentials, Git history, dependencies and generated build folders from the ZIP.

Internal photo provenance and font licences remain included. One representative steel-plant photograph retains its existing remote provider URL and local fallback; the company's six project photographs are local files in this package.
