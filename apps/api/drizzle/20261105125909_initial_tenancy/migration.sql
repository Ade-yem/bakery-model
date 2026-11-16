CREATE TYPE "department_type" AS ENUM('RECEPTION', 'PRODUCTION', 'DISPATCH', 'STORE');--> statement-breakpoint
CREATE TYPE "membership_status" AS ENUM('INVITED', 'ACTIVE', 'SUSPENDED', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "record_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "tenant_status" AS ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"code" varchar(50) NOT NULL,
	"timezone" varchar(100) NOT NULL,
	"status" "record_status" DEFAULT 'ACTIVE'::"record_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branches_tenant_code_unique" UNIQUE("tenant_id","code"),
	CONSTRAINT "branches_tenant_id_id_unique" UNIQUE("tenant_id","id")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"type" "department_type" NOT NULL,
	"name" varchar(160) NOT NULL,
	"status" "record_status" DEFAULT 'ACTIVE'::"record_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_tenant_id_id_unique" UNIQUE("tenant_id","id"),
	CONSTRAINT "departments_branch_name_unique" UNIQUE("tenant_id","branch_id","name")
);
--> statement-breakpoint
CREATE TABLE "membership_branches" (
	"tenant_id" uuid,
	"membership_id" uuid,
	"branch_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_branches_pkey" PRIMARY KEY("tenant_id","membership_id","branch_id")
);
--> statement-breakpoint
CREATE TABLE "membership_departments" (
	"tenant_id" uuid,
	"membership_id" uuid,
	"department_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_departments_pkey" PRIMARY KEY("tenant_id","membership_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"tenant_id" uuid,
	"role_key" varchar(100),
	"permission_key" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_pkey" PRIMARY KEY("tenant_id","role_key","permission_key")
);
--> statement-breakpoint
CREATE TABLE "tenant_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"auth_user_id" varchar(255) NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"role_key" varchar(100) NOT NULL,
	"status" "membership_status" DEFAULT 'INVITED'::"membership_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_memberships_tenant_user_unique" UNIQUE("tenant_id","auth_user_id"),
	CONSTRAINT "tenant_memberships_tenant_id_id_unique" UNIQUE("tenant_id","id")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(160) NOT NULL,
	"status" "tenant_status" DEFAULT 'ACTIVE'::"tenant_status" NOT NULL,
	"subscription_tier" varchar(50) NOT NULL,
	"subscription_status" varchar(50) NOT NULL,
	"default_currency" varchar(3) NOT NULL,
	"settings" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "branches_tenant_status_created_at_idx" ON "branches" ("tenant_id","status","created_at");--> statement-breakpoint
CREATE INDEX "departments_tenant_branch_status_idx" ON "departments" ("tenant_id","branch_id","status");--> statement-breakpoint
CREATE INDEX "membership_branches_branch_idx" ON "membership_branches" ("tenant_id","branch_id");--> statement-breakpoint
CREATE INDEX "membership_departments_department_idx" ON "membership_departments" ("tenant_id","department_id");--> statement-breakpoint
CREATE INDEX "role_permissions_tenant_role_idx" ON "role_permissions" ("tenant_id","role_key");--> statement-breakpoint
CREATE INDEX "tenant_memberships_tenant_status_idx" ON "tenant_memberships" ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "tenants_status_created_at_idx" ON "tenants" ("status","created_at");--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_branch_fk" FOREIGN KEY ("tenant_id","branch_id") REFERENCES "branches"("tenant_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "membership_branches" ADD CONSTRAINT "membership_branches_membership_fk" FOREIGN KEY ("tenant_id","membership_id") REFERENCES "tenant_memberships"("tenant_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "membership_branches" ADD CONSTRAINT "membership_branches_branch_fk" FOREIGN KEY ("tenant_id","branch_id") REFERENCES "branches"("tenant_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "membership_departments" ADD CONSTRAINT "membership_departments_membership_fk" FOREIGN KEY ("tenant_id","membership_id") REFERENCES "tenant_memberships"("tenant_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "membership_departments" ADD CONSTRAINT "membership_departments_department_fk" FOREIGN KEY ("tenant_id","department_id") REFERENCES "departments"("tenant_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT;