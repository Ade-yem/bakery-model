import {
  boolean,
  foreignKey,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const tenantStatusEnum = pgEnum('tenant_status', [
  'ACTIVE',
  'SUSPENDED',
  'INACTIVE',
]);

export const recordStatusEnum = pgEnum('record_status', ['ACTIVE', 'INACTIVE']);

export const membershipStatusEnum = pgEnum('membership_status', [
  'INVITED',
  'ACTIVE',
  'SUSPENDED',
  'INACTIVE',
]);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    status: tenantStatusEnum('status').default('ACTIVE').notNull(),
    subscriptionTier: varchar('subscription_tier', { length: 50 }).notNull(),
    subscriptionStatus: varchar('subscription_status', {
      length: 50,
    }).notNull(),
    defaultCurrency: varchar('default_currency', { length: 3 }).notNull(),
    settings: jsonb('settings')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    ...timestamps,
  },
  (table) => [
    index('tenants_status_created_at_idx').on(table.status, table.createdAt),
  ],
);

export const branches = pgTable(
  'branches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 160 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    timezone: varchar('timezone', { length: 100 }).notNull(),
    status: recordStatusEnum('status').default('ACTIVE').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('branches_tenant_code_unique').on(table.tenantId, table.code),
    unique('branches_tenant_id_id_unique').on(table.tenantId, table.id),
    index('branches_tenant_status_created_at_idx').on(
      table.tenantId,
      table.status,
      table.createdAt,
    ),
  ],
);

export const departments = pgTable(
  'departments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    name: varchar('name', { length: 160 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    type: varchar('type', { length: 100 }).default('PRODUCTION').notNull(),
    description: text('description'),
    status: recordStatusEnum('status').default('ACTIVE').notNull(),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      name: 'departments_tenant_branch_fk',
      columns: [table.tenantId, table.branchId],
      foreignColumns: [branches.tenantId, branches.id],
    }).onDelete('restrict'),
    unique('departments_tenant_id_id_unique').on(table.tenantId, table.id),
    unique('departments_branch_code_unique').on(
      table.tenantId,
      table.branchId,
      table.code,
    ),
    unique('departments_branch_name_unique').on(
      table.tenantId,
      table.branchId,
      table.name,
    ),
    index('departments_tenant_branch_status_idx').on(
      table.tenantId,
      table.branchId,
      table.status,
    ),
  ],
);

export const tenantMemberships = pgTable(
  'tenant_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    authUserId: varchar('auth_user_id', { length: 255 }).notNull(),
    displayName: varchar('display_name', { length: 160 }).notNull(),
    roleKey: varchar('role_key', { length: 100 }).notNull(),
    status: membershipStatusEnum('status').default('INVITED').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('tenant_memberships_tenant_user_unique').on(
      table.tenantId,
      table.authUserId,
    ),
    unique('tenant_memberships_tenant_id_id_unique').on(
      table.tenantId,
      table.id,
    ),
    index('tenant_memberships_tenant_status_idx').on(
      table.tenantId,
      table.status,
    ),
  ],
);

export const membershipBranches = pgTable(
  'membership_branches',
  {
    tenantId: uuid('tenant_id').notNull(),
    membershipId: uuid('membership_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.tenantId, table.membershipId, table.branchId],
    }),
    foreignKey({
      name: 'membership_branches_membership_fk',
      columns: [table.tenantId, table.membershipId],
      foreignColumns: [tenantMemberships.tenantId, tenantMemberships.id],
    }).onDelete('restrict'),
    foreignKey({
      name: 'membership_branches_branch_fk',
      columns: [table.tenantId, table.branchId],
      foreignColumns: [branches.tenantId, branches.id],
    }).onDelete('restrict'),
    index('membership_branches_branch_idx').on(table.tenantId, table.branchId),
  ],
);

export const membershipDepartments = pgTable(
  'membership_departments',
  {
    tenantId: uuid('tenant_id').notNull(),
    membershipId: uuid('membership_id').notNull(),
    departmentId: uuid('department_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.tenantId, table.membershipId, table.departmentId],
    }),
    foreignKey({
      name: 'membership_departments_membership_fk',
      columns: [table.tenantId, table.membershipId],
      foreignColumns: [tenantMemberships.tenantId, tenantMemberships.id],
    }).onDelete('restrict'),
    foreignKey({
      name: 'membership_departments_department_fk',
      columns: [table.tenantId, table.departmentId],
      foreignColumns: [departments.tenantId, departments.id],
    }).onDelete('restrict'),
    index('membership_departments_department_idx').on(
      table.tenantId,
      table.departmentId,
    ),
  ],
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    roleKey: varchar('role_key', { length: 100 }).notNull(),
    permissionKey: varchar('permission_key', { length: 160 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.tenantId, table.roleKey, table.permissionKey],
    }),
    index('role_permissions_tenant_role_idx').on(table.tenantId, table.roleKey),
  ],
);

export const tenantRoles = pgTable(
  'tenant_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 160 }).notNull(),
    description: text('description'),
    isSystem: boolean('is_system').default(false).notNull(),
    status: recordStatusEnum('status').default('ACTIVE').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('tenant_roles_tenant_code_unique').on(table.tenantId, table.code),
    unique('tenant_roles_tenant_id_id_unique').on(table.tenantId, table.id),
    index('tenant_roles_tenant_status_idx').on(table.tenantId, table.status),
  ],
);

export const roleDepartments = pgTable(
  'role_departments',
  {
    tenantId: uuid('tenant_id').notNull(),
    roleId: uuid('role_id').notNull(),
    departmentId: uuid('department_id').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.tenantId, table.roleId, table.departmentId],
    }),
    foreignKey({
      name: 'role_departments_role_fk',
      columns: [table.tenantId, table.roleId],
      foreignColumns: [tenantRoles.tenantId, tenantRoles.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'role_departments_department_fk',
      columns: [table.tenantId, table.departmentId],
      foreignColumns: [departments.tenantId, departments.id],
    }).onDelete('cascade'),
    index('role_departments_department_idx').on(
      table.tenantId,
      table.departmentId,
    ),
  ],
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type TenantMembership = typeof tenantMemberships.$inferSelect;
export type NewTenantMembership = typeof tenantMemberships.$inferInsert;
export type TenantRole = typeof tenantRoles.$inferSelect;
export type NewTenantRole = typeof tenantRoles.$inferInsert;
export type RoleDepartment = typeof roleDepartments.$inferSelect;
export type NewRoleDepartment = typeof roleDepartments.$inferInsert;
