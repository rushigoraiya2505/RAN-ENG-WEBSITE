# RAN ENGINEERS — complete GitHub + Cloudflare deployment

**Website source: published version 10, exported 23 November 2026.**

This package contains the current RAN ENGINEERS website, its enquiry Worker, database migrations, photographs, fonts, interactive dam-gate demonstration and deployment automation. It includes the Kadana Dam correction, Pipavav panel commissioning wording, product specification updates, homepage project gallery, refined spacing and footer, and removal of the public Image credits page.

Use this package in place of the earlier `RAN-ENGINEERS-GitHub-Source.zip`. This is a complete source project, not a patch. Upload its **contents** to the repository root so `package.json` and `.github/` are at the top level. Your current live website is not changed by downloading or uploading this package.

## Start here

The recommended path is **GitHub Actions → Cloudflare Workers**. It needs two GitHub secrets, then one manual workflow run. No database UUID needs to be pasted into the website code.

1. Extract the ZIP. Upload all extracted project files to your GitHub repository. Include `.github/workflows/` and the other dotfiles. Read `START-HERE.txt` for Windows upload instructions.
2. Sign into your own Cloudflare account and enable **R2 Object Storage** if it has not been activated. Cloudflare may ask for billing details or service terms; complete this in your account. The setup script does not enable subscriptions or purchase plans. In **Workers & Pages**, also finish initial account setup and choose your `workers.dev` subdomain if Cloudflare prompts you.
3. Create a Cloudflare API token, scoped to this account, with these **Account** permissions:

   | Permission | Access |
   | --- | --- |
   | Workers Scripts | Edit |
   | D1 | Edit |
   | Workers R2 Storage | Edit |
   | Account Settings | Read |

   Cloudflare's API documentation sometimes calls the Edit level “Write”. Use a regular Cloudflare API token with these permissions. An R2 S3 access key or the global API key is not the token expected here. The deployment package does not change DNS and does not require zone/DNS permissions.

4. In your **GitHub repository**, open **Settings → Secrets and variables → Actions → New repository secret**. Add these exact names:

   | Secret name | Value from your Cloudflare account |
   | --- | --- |
   | `CLOUDFLARE_ACCOUNT_ID` | Your 32-character account ID |
   | `CLOUDFLARE_API_TOKEN` | The API token created above |

   Keep the values in GitHub Secrets. They are deliberately absent from this ZIP.

5. Open **Actions → Deploy RAN ENGINEERS to Cloudflare → Run workflow**. Select your default branch (normally `main`) and run it. If Actions asks you to enable workflows for the repository, enable them. The workflow file must be committed to the default branch before the Run workflow button appears.
6. The run installs the locked dependencies, checks the backend and simulator, creates or reuses the named D1/R2 resources, builds the website, checks the built application locally, applies pending database migrations and deploys the Worker with its assets. Open the **workers.dev URL printed in the deployment log**.
7. Test the pages, project photographs and enquiry form. After a test submission, verify its receipt and record in D1 and its optional file in R2. Complete the existing-data migration described in `docs/DATA-MIGRATION.md` before moving your company domain if earlier enquiries must remain available.

**The deployment creates an independent Cloudflare website. It does not automatically move `www.ranengineers.com`, cancel ChatGPT hosting, export the existing enquiry database or copy existing uploaded attachments.**

## Default Cloudflare resources

| Resource | Default name | Worker binding |
| --- | --- | --- |
| Worker | `ran-engineers` | — |
| D1 database | `ran-engineers-enquiries` | `DB` |
| Private R2 bucket | `ran-engineers-enquiry-attachments` | `BUCKET` |
| Built website assets | `dist/client/` | `ASSETS` |

Setup looks up the exact database/bucket names and reuses them on later runs. It never deletes either resource. Do not change these names after collecting enquiries unless you are deliberately migrating data.

Optional GitHub repository **variables** (same Settings screen, Variables tab):

| Variable | Purpose / default |
| --- | --- |
| `CLOUDFLARE_AUTO_DEPLOY` | Set to `true` to deploy subsequent pushes to `main` automatically. The first deployment is manual by default. |
| `VITE_SITE_URL` | Canonical company URL; defaults to `https://www.ranengineers.com`. |
| `RAN_WORKER_NAME` | Override `ran-engineers` if needed. |
| `RAN_DATABASE_NAME` | Override the default D1 name before first deployment. |
| `RAN_BUCKET_NAME` | Override the default R2 name before first deployment. |

No automatic custom-domain route is included. Attach your domain only after the new deployment and data migration are ready. Follow `docs/DEPLOYMENT.md`.

## What is preserved

- All website pages, actual project photographs and their ordering.
- The same company logo, colours, typography and contact details.
- Homepage automatic photo gallery, enlarged project views and interactive dam-gate simulator.
- Enquiry validation, session challenges, duplicate-submission protection, rate limits, optional attachments and stored receipt references.
- Database schema and both SQL migrations, including the `payload_hash` field.

The exported frontend differs from published version 10 only in its default canonical URL, now the company domain. The application Worker and migrations are unchanged. ChatGPT-specific build adapters and Site identity are replaced by ordinary Cloudflare configuration. Internal image provenance is retained in `CREDITS.md`; it is not a public website page.

## What the enquiry service does

The form calls same-origin `GET /api/enquiry-token` and `POST /api/enquiries`. A successful submission stores the enquiry in D1 and an optional attachment in private R2, then shows a reference such as `RAN-YYYYMMDD-XXXXXXXX`.

**Stored enquiries do not automatically generate email notifications.** This preserves the existing system. Review records through Cloudflare D1 or an authorised administrative process. The public API does not list customer enquiries or expose attachment downloads.

This ZIP contains schema and code, not current customer enquiry rows or uploaded files. A fresh Cloudflare account starts with an empty enquiry database. Database records and R2 objects require a separate migration; keep them out of GitHub.

## Local development

Install **Node.js 24**. From the extracted project directory:

```sh
npm ci
npm run db:migrate:local
npm run dev
```

Open the local URL printed by Vite. The local database and bucket are emulated under `.wrangler/state`; local submissions do not go to the existing live website.

Production build and checks:

```sh
npm run check:worker
npm test
npm run test:setup
npm run build
npm run deploy:check
npm run test:deployment
npm run preview
```

`test:deployment` uses an isolated local Workers runtime and disposable storage. It checks the actual compiled Worker and enquiry persistence; it never submits to the live company website.

## Command summary

| Command | Behaviour |
| --- | --- |
| `npm run cf:config` | Creates ignored `wrangler.generated.json` for local development; no network. |
| `npm run cf:setup` | Creates/reuses real Cloudflare D1/R2 resources using the two environment credentials; writes their IDs into the ignored configuration. |
| `npm run build` | Type-checks and builds the Worker plus prerendered website. No cloud credentials required. |
| `npm run build:cloudflare` | Configures real Cloudflare resources, builds and validates. Does not publish. |
| `npm run deploy:prepared` | Validates an already configured build, checks migration history, applies pending remote migrations and publishes. |
| `npm run deploy:cloudflare` | Runs the full configure → build → migrate → publish sequence. |
| `npm run db:migrate:local` | Applies the same migrations to local development storage. |

Use the same Cloudflare credentials and resource names for each update. Do not upload just `dist/client/` to GitHub Pages or a static-only host: the enquiry API requires the Worker, D1 and R2.

## Files to read

- `START-HERE.txt`: short upload and deployment instructions.
- `docs/DEPLOYMENT.md`: dashboard alternative, custom domain, updates and troubleshooting.
- `docs/DATA-MIGRATION.md`: preserve existing enquiries and attachments when changing hosting.
- `docs/ARCHITECTURE.md`: application structure and backend behaviour.
- `docs/VERIFICATION.md`: packaging checks and limits.
- `EXPORT-INFO.json`: original source version and commit.

## Official references

- [Cloudflare: GitHub Actions deployments](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Cloudflare: Vite plugin configuration](https://developers.cloudflare.com/workers/vite-plugin/reference/api/)
- [Cloudflare: D1 migration commands](https://developers.cloudflare.com/d1/wrangler-commands/#d1-migrations-apply)
- [Cloudflare: Workers Builds settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Cloudflare: Worker custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [GitHub: repository secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
- [GitHub: run a workflow manually](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
