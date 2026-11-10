CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"actor_auth_user_id" text NOT NULL,
	"actor_membership_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"subject_type" varchar(100) NOT NULL,
	"subject_id" varchar(100) NOT NULL,
	"request_id" varchar(100) NOT NULL,
	"summary" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"item_type" varchar(50) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"normalized_name" varchar(255) NOT NULL,
	"category" varchar(100),
	"uom" varchar(50) NOT NULL,
	"selling_price" numeric(19,4),
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_items_tenant_sku_unique" UNIQUE("tenant_id","sku")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"normalized_name" varchar(255) NOT NULL,
	"external_reference" varchar(100),
	"phone" varchar(50),
	"email" varchar(255),
	"credit_ceiling" numeric(19,4) DEFAULT '0.0000' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idempotency_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"idempotency_key" varchar(255) NOT NULL,
	"operation" varchar(100) NOT NULL,
	"request_fingerprint" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'STARTED' NOT NULL,
	"response_body" jsonb,
	"response_status" varchar(10),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "idempotency_tenant_key_unique" UNIQUE("tenant_id","idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"normalized_name" varchar(255) NOT NULL,
	"external_reference" varchar(100),
	"contact_name" varchar(255),
	"contact_phone" varchar(50),
	"contact_email" varchar(255),
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "audit_events_tenant_idx" ON "audit_events" ("tenant_id");--> statement-breakpoint
CREATE INDEX "catalog_items_tenant_idx" ON "catalog_items" ("tenant_id");--> statement-breakpoint
CREATE INDEX "customers_tenant_idx" ON "customers" ("tenant_id");--> statement-breakpoint
CREATE INDEX "idempotency_tenant_idx" ON "idempotency_records" ("tenant_id");--> statement-breakpoint
CREATE INDEX "suppliers_tenant_idx" ON "suppliers" ("tenant_id");--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT;