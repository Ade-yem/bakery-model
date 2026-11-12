import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenancy.schema.js';

export const billingIntervalEnum = pgEnum('billing_interval', [
  'MONTHLY',
  'YEARLY',
]);

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'STARTER',
  'GROWTH',
  'ENTERPRISE',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'SUSPENDED',
  'CANCELED',
]);

export const subscriptionInvoiceStatusEnum = pgEnum(
  'subscription_invoice_status',
  ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
);

export const webhookEventStatusEnum = pgEnum('webhook_event_status', [
  'RECEIVED',
  'PROCESSED',
  'FAILED',
  'IGNORED',
]);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const subscriptionPlans = pgTable(
  'subscription_plans',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    tier: subscriptionTierEnum('tier').notNull(),
    description: text('description'),
    priceAmount: numeric('price_amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    interval: billingIntervalEnum('interval').notNull(),
    maxBranches: integer('max_branches').default(1).notNull(),
    maxStaff: integer('max_staff').default(10).notNull(),
    flwPlanId: varchar('flw_plan_id', { length: 100 }),
    active: boolean('active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    unique('subscription_plans_code_unique').on(table.code),
    index('subscription_plans_tier_interval_idx').on(
      table.tier,
      table.interval,
      table.active,
    ),
  ],
);

export const tenantSubscriptions = pgTable(
  'tenant_subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: 'restrict' }),
    status: subscriptionStatusEnum('status').default('TRIALING').notNull(),
    currentPeriodStart: timestamp('current_period_start', {
      withTimezone: true,
    }).notNull(),
    currentPeriodEnd: timestamp('current_period_end', {
      withTimezone: true,
    }).notNull(),
    gracePeriodEnd: timestamp('grace_period_end', { withTimezone: true }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
    flwSubscriptionId: varchar('flw_subscription_id', { length: 100 }),
    flwCustomerToken: varchar('flw_customer_token', { length: 100 }),
    canceledAt: timestamp('canceled_at', { withTimezone: true }),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    ...timestamps,
  },
  (table) => [
    unique('tenant_subscriptions_tenant_id_unique').on(table.tenantId),
    index('tenant_subscriptions_tenant_status_idx').on(
      table.tenantId,
      table.status,
    ),
    index('tenant_subscriptions_status_period_end_idx').on(
      table.status,
      table.currentPeriodEnd,
    ),
  ],
);

export const subscriptionInvoices = pgTable(
  'subscription_invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id').references(
      () => tenantSubscriptions.id,
      { onDelete: 'set null' },
    ),
    planId: uuid('plan_id')
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: 'restrict' }),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    status: subscriptionInvoiceStatusEnum('status')
      .default('PENDING')
      .notNull(),
    txRef: varchar('tx_ref', { length: 100 }).notNull(),
    flwRef: varchar('flw_ref', { length: 100 }),
    flwTransactionId: varchar('flw_transaction_id', { length: 100 }),
    paymentMethod: varchar('payment_method', { length: 50 }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    failureReason: text('failure_reason'),
    ...timestamps,
  },
  (table) => [
    unique('subscription_invoices_invoice_number_unique').on(
      table.invoiceNumber,
    ),
    unique('subscription_invoices_tx_ref_unique').on(table.txRef),
    index('subscription_invoices_tenant_created_idx').on(
      table.tenantId,
      table.createdAt,
    ),
  ],
);

export const paymentWebhookEvents = pgTable(
  'payment_webhook_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    provider: varchar('provider', { length: 30 })
      .default('FLUTTERWAVE')
      .notNull(),
    eventId: varchar('event_id', { length: 120 }),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    txRef: varchar('tx_ref', { length: 100 }),
    status: webhookEventStatusEnum('status').default('RECEIVED').notNull(),
    payload: jsonb('payload').notNull(),
    errorMessage: text('error_message'),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index('payment_webhook_events_event_id_idx').on(table.eventId),
    index('payment_webhook_events_tx_ref_status_idx').on(
      table.txRef,
      table.status,
    ),
    index('payment_webhook_events_status_created_idx').on(
      table.status,
      table.createdAt,
    ),
  ],
);
