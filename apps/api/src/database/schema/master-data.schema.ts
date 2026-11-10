import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  unique,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenancy.schema.js';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const catalogItems = pgTable(
  'catalog_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    itemType: varchar('item_type', { length: 50 }).notNull(),
    sku: varchar('sku', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    normalizedName: varchar('normalized_name', { length: 255 }).notNull(),
    category: varchar('category', { length: 100 }),
    uom: varchar('uom', { length: 50 }).notNull(),
    sellingPrice: numeric('selling_price', { precision: 19, scale: 4 }),
    currency: varchar('currency', { length: 3 }).default('USD'),
    status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('catalog_items_tenant_sku_unique').on(table.tenantId, table.sku),
    index('catalog_items_tenant_idx').on(table.tenantId),
  ],
);

export const suppliers = pgTable(
  'suppliers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    normalizedName: varchar('normalized_name', { length: 255 }).notNull(),
    externalReference: varchar('external_reference', { length: 100 }),
    contactName: varchar('contact_name', { length: 255 }),
    contactPhone: varchar('contact_phone', { length: 50 }),
    contactEmail: varchar('contact_email', { length: 255 }),
    status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
    ...timestamps,
  },
  (table) => [
    index('suppliers_tenant_idx').on(table.tenantId),
  ],
);

export const customers = pgTable(
  'customers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    normalizedName: varchar('normalized_name', { length: 255 }).notNull(),
    externalReference: varchar('external_reference', { length: 100 }),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),
    creditCeiling: numeric('credit_ceiling', { precision: 19, scale: 4 }).default('0.0000').notNull(),
    currency: varchar('currency', { length: 3 }).default('USD').notNull(),
    status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
    ...timestamps,
  },
  (table) => [
    index('customers_tenant_idx').on(table.tenantId),
  ],
);

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    actorAuthUserId: text('actor_auth_user_id').notNull(),
    actorMembershipId: uuid('actor_membership_id').notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    subjectType: varchar('subject_type', { length: 100 }).notNull(),
    subjectId: varchar('subject_id', { length: 100 }).notNull(),
    requestId: varchar('request_id', { length: 100 }).notNull(),
    summary: jsonb('summary').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('audit_events_tenant_idx').on(table.tenantId),
  ],
);

export const idempotencyRecords = pgTable(
  'idempotency_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull(),
    operation: varchar('operation', { length: 100 }).notNull(),
    requestFingerprint: varchar('request_fingerprint', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).default('STARTED').notNull(),
    responseBody: jsonb('response_body'),
    responseStatus: varchar('response_status', { length: 10 }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('idempotency_tenant_key_unique').on(table.tenantId, table.idempotencyKey),
    index('idempotency_tenant_idx').on(table.tenantId),
  ],
);
