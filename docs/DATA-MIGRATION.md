# Preserve existing enquiries and attachments

## Scope of this ZIP

The ZIP exports the current website application and database schema. It does **not** contain live customer enquiry rows, private attachment objects, cloud credentials or access to the managed ChatGPT Site's storage. Creating a new D1 database does not transfer the existing one.

Keep the original site and its storage available until the migration is verified. A source-code upload to GitHub is not a backup of enquiry data.

## Recommended migration path

1. Obtain an authorised export of the existing `enquiries` table and every referenced R2 attachment from the current hosting provider. If direct account access to the managed storage is unavailable, arrange an export through that provider before moving the domain. Do not assume your own Cloudflare account can access the managed Site's database by name.
2. Record the old enquiry row count, unique receipt references and non-null attachment keys. Store this export securely outside the Git repository.
3. Use this package to create a **new** database and bucket in your Cloudflare account. Let the normal workflow apply both migrations to establish the schema and Wrangler's `d1_migrations` history.
4. Import the old enquiry rows as **data only** into the new database. Include the explicit column names. Preserve `id`, `reference`, `request_key`, timestamps, all contact and requirement fields, attachment metadata and `payload_hash`. Do not run a complete old schema dump over the new schema. Do not replace or delete existing rows to resolve conflicts; compare duplicate keys and references first.
5. Copy each attachment object to the new private R2 bucket using the **same object key** stored in `attachment_key`. Preserve object bytes, content metadata and the enquiry reference in custom metadata where available. Do not enable public bucket access to make the form work.
6. Confirm row counts and receipt references match. For every non-null attachment key, verify the object exists and compare its byte size or hash with the original. Test one new enquiry with an attachment in the new deployment.
7. Agree a cutover window, account for any enquiries received on the original site after the first export, migrate that final difference, and only then connect the company domain to the new Worker.
8. Keep the original backup and hosting available until the new site has been verified on the custom domain.

`enquiry_challenges` stores short-lived form sessions, not business enquiries. It need not be migrated; visitors can start new sessions on the new site.

## Schema compatibility

Apply these files in order through Wrangler's migration command:

1. `drizzle/0000_swift_hitman.sql` — enquiries, challenges and indexes.
2. `drizzle/0001_brown_justice.sql` — `payload_hash` for duplicate-submission checking.

The deploy script checks migration history before applying initial schema files. If it finds an existing enquiry schema with no matching Wrangler history, it stops with an explanation. This avoids running `CREATE TABLE` over a full imported database. The recommended route is a fresh migrated destination plus a reviewed data-only import.

If older records lack `payload_hash`, retain the default empty string only after reviewing the source schema. Do not invent hashes for historical payloads. A new visitor can make a new submission with a new request identifier.

## Independent backups after migration

Keep routine D1 exports and R2 backups in private storage outside GitHub. With your own Cloudflare account authenticated, Wrangler can export D1:

```sh
npx wrangler d1 export DB --remote --config wrangler.generated.json --output backups/enquiries.sql
```

Create the `backups` directory first. Review Cloudflare's current export and R2 copy instructions before running a migration. The `.gitignore` excludes the backups directory, but still check every Git commit for customer data.

Official references:

- https://developers.cloudflare.com/d1/wrangler-commands/
- https://developers.cloudflare.com/d1/best-practices/import-export-data/
- https://developers.cloudflare.com/r2/objects/upload-objects/
