import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Durable enquiries are private records. They are never served by public GET routes.
export const enquiries = sqliteTable('enquiries', {
  id: text('id').primaryKey(), reference: text('reference').notNull(), requestKey: text('request_key').notNull(), payloadHash: text('payload_hash').notNull().default(''),
  receivedAt: integer('received_at').notNull(), fullName: text('full_name').notNull(),
  company: text('company').notNull().default(''), phone: text('phone').notNull(), email: text('email').notNull(),
  requirement: text('requirement').notNull(), location: text('location').notNull().default(''), quantity: text('quantity').notNull().default(''), message: text('message').notNull(),
  consentVersion: text('consent_version').notNull().default('2026-11'), attachmentKey: text('attachment_key'), attachmentName: text('attachment_name'), attachmentType: text('attachment_type'), attachmentSize: integer('attachment_size'), clientHash: text('client_hash').notNull(),
}, table => [uniqueIndex('enquiries_reference_idx').on(table.reference), uniqueIndex('enquiries_request_idx').on(table.requestKey), index('enquiries_received_idx').on(table.receivedAt), index('enquiries_client_idx').on(table.clientHash, table.receivedAt)]);

export const enquiryChallenges = sqliteTable('enquiry_challenges', {
  id: text('id').primaryKey(), clientHash: text('client_hash').notNull(), createdAt: integer('created_at').notNull(), expiresAt: integer('expires_at').notNull(), used: integer('used').notNull().default(0),
}, table => [index('enquiry_challenges_client_idx').on(table.clientHash, table.createdAt), index('enquiry_challenges_expiry_idx').on(table.expiresAt)]);
