CREATE TYPE "billing_interval" AS ENUM('MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "subscription_invoice_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "subscription_status" AS ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "subscription_tier" AS ENUM('STARTER', 'GROWTH', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "webhook_event_status" AS ENUM('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"provider" varchar(30) DEFAULT 'FLUTTERWAVE' NOT NULL,
	"event_id" varchar(120),
	"event_type" varchar(100) NOT NULL,
	"tx_ref" varchar(100),
	"status" "webhook_event_status" DEFAULT 'RECEIVED'::"webhook_event_status" NOT NULL,
	"payload" jsonb NOT NULL,
	"error_message" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"subscription_id" uuid,
	"plan_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL CONSTRAINT "subscription_invoices_invoice_number_unique" UNIQUE,
	"amount" numeric(12,2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" "subscription_invoice_status" DEFAULT 'PENDING'::"subscription_invoice_status" NOT NULL,
	"tx_ref" varchar(100) NOT NULL CONSTRAINT "subscription_invoices_tx_ref_unique" UNIQUE,
	"flw_ref" varchar(100),
	"flw_transaction_id" varchar(100),
	"payment_method" varchar(50),
	"paid_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL CONSTRAINT "subscription_plans_code_unique" UNIQUE,
	"name" varchar(100) NOT NULL,
	"tier" "subscription_tier" NOT NULL,
	"description" text,
	"price_amount" numeric(12,2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"interval" "billing_interval" NOT NULL,
	"max_branches" integer DEFAULT 1 NOT NULL,
	"max_staff" integer DEFAULT 10 NOT NULL,
	"flw_plan_id" varchar(100),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL CONSTRAINT "tenant_subscriptions_tenant_id_unique" UNIQUE,
	"plan_id" uuid NOT NULL,
	"status" "subscription_status" DEFAULT 'TRIALING'::"subscription_status" NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"grace_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"flw_subscription_id" varchar(100),
	"flw_customer_token" varchar(100),
	"canceled_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "payment_webhook_events_event_id_idx" ON "payment_webhook_events" ("event_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_tx_ref_status_idx" ON "payment_webhook_events" ("tx_ref","status");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_status_created_idx" ON "payment_webhook_events" ("status","created_at");--> statement-breakpoint
CREATE INDEX "subscription_invoices_tenant_created_idx" ON "subscription_invoices" ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "subscription_plans_tier_interval_idx" ON "subscription_plans" ("tier","interval","active");--> statement-breakpoint
CREATE INDEX "tenant_subscriptions_tenant_status_idx" ON "tenant_subscriptions" ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "tenant_subscriptions_status_period_end_idx" ON "tenant_subscriptions" ("status","current_period_end");--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_1kivJQNB0RoK_fkey" FOREIGN KEY ("subscription_id") REFERENCES "tenant_subscriptions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_plan_id_subscription_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_plan_id_subscription_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT;