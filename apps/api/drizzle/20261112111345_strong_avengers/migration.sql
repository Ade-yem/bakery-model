CREATE TABLE "role_departments" (
	"tenant_id" uuid,
	"role_id" uuid,
	"department_id" uuid,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_departments_pkey" PRIMARY KEY("tenant_id","role_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "tenant_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"status" "record_status" DEFAULT 'ACTIVE'::"record_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_roles_tenant_code_unique" UNIQUE("tenant_id","code"),
	CONSTRAINT "tenant_roles_tenant_id_id_unique" UNIQUE("tenant_id","id")
);
--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "code" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "type" SET DATA TYPE varchar(100) USING "type"::varchar(100);--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "type" SET DEFAULT 'PRODUCTION';--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_branch_code_unique" UNIQUE("tenant_id","branch_id","code");--> statement-breakpoint
CREATE INDEX "role_departments_department_idx" ON "role_departments" ("tenant_id","department_id");--> statement-breakpoint
CREATE INDEX "tenant_roles_tenant_status_idx" ON "tenant_roles" ("tenant_id","status");--> statement-breakpoint
ALTER TABLE "role_departments" ADD CONSTRAINT "role_departments_role_fk" FOREIGN KEY ("tenant_id","role_id") REFERENCES "tenant_roles"("tenant_id","id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_departments" ADD CONSTRAINT "role_departments_department_fk" FOREIGN KEY ("tenant_id","department_id") REFERENCES "departments"("tenant_id","id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tenant_roles" ADD CONSTRAINT "tenant_roles_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT;--> statement-breakpoint
DROP TYPE "department_type";