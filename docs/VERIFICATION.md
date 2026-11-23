# Export verification — 23 November 2026

## Source fidelity

- Based on published website source version 10, commit `5f445b5194b6b7a18b422c874da1aa886ba2fa14`.
- Compared 78 application, asset, Worker and schema files with that checkout. The only application difference is `src/site.ts`, whose default canonical origin is now the company domain.
- All six supplied project photographs are byte-for-byte unchanged.
- Original hosted Site source remains clean and was not modified or republished during packaging.

## Checks performed successfully

| Check | Result |
| --- | --- |
| Dependency installation with the supplied lockfile | Passed |
| TypeScript and production Worker/client build | Passed |
| Prerendered website | 20 routes plus one noindex 404 document |
| Backend TypeScript check | Passed |
| Existing application tests | 30 passed: 10 dam-gate model, 4 field/file validation, 16 Worker behaviour tests |
| Cloudflare resource setup tests | 8 passed, using mocked Cloudflare APIs |
| Local Wrangler migrations | Both SQL migrations applied successfully |
| Built deployment configuration | Worker/client outputs and ASSETS/DB/BUCKET bindings checked |
| Actual compiled Worker in local Miniflare | Home, About, Projects and Contact return HTML; removed Image credits URL returns 404 |
| Local enquiry and attachment persistence | Confirmed stored receipt in local D1 and matching attachment bytes in local R2 |
| Duplicate retry and privacy | Same receipt returned with one row/object; public GET cannot list enquiries |

The integration test uses isolated temporary storage and the actual compiled Worker. It does not send a production enquiry, contact customers or access a Cloudflare account.

## Verification limits

The remote provisioning API, real Cloudflare account permissions and publication have not been exercised with your own credentials. Enter the two required GitHub Secrets and run the included workflow to perform those account-specific steps. The setup tests verify first run, resource reuse, pagination/exact names, missing permissions, creation races, partial failures and token redaction using mocked API responses.

The ZIP does not contain or migrate the current live D1 enquiry records or R2 objects. Follow DATA-MIGRATION.md before domain cutover when preserving historical enquiries is required.

No new visual redesign was made for this export. Application pages, styling and local photographs are retained from the already published website source.
