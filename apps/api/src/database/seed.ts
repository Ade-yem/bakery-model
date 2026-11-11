import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema/index.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../access-control/permissions.js';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/tallybakery';

const db = drizzle(connectionString);

async function seed() {
  console.log('Starting seed...');

  // 1. Create default owner user
  const [user] = await db
    .insert(schema.user)
    .values({
      id: 'owner-user-seed-id',
      name: 'Bakery Owner',
      email: 'owner@tallybakery.local',
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning();

  let userId = user?.id;
  if (!userId) {
    const [existing] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, 'owner@tallybakery.local'))
      .limit(1);
    userId = existing?.id;
  }

  if (!userId) {
    console.error('Could not find or create user');
    process.exit(1);
  }

  // 2. Create tenant
  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      name: 'Tally Artisan Bakery',
      status: 'ACTIVE',
      subscriptionTier: 'STANDARD',
      subscriptionStatus: 'ACTIVE',
      defaultCurrency: 'USD',
      settings: {},
    })
    .returning();

  // 3. Create main branch
  const [branch] = await db
    .insert(schema.branches)
    .values({
      tenantId: tenant.id,
      name: 'Downtown Main',
      code: 'MAIN-01',
      timezone: 'UTC',
      status: 'ACTIVE',
    })
    .returning();

  // 4. Create tenant baseline departments
  const defaultDepartments = [
    { name: 'Reception', type: 'RECEPTION' },
    { name: 'Production', type: 'PRODUCTION' },
    { name: 'Disbursement', type: 'DISBURSEMENT' },
    { name: 'Store', type: 'STORE' },
  ] as const;

  const insertedDepartments = await Promise.all(
    defaultDepartments.map(async ({ name, type }) =>
      db
        .insert(schema.departments)
        .values({
          tenantId: tenant.id,
          branchId: branch.id,
          name,
          type,
          status: 'ACTIVE',
        })
        .returning(),
    ),
  );

  const departmentsByName = new Map(
    insertedDepartments.flat().map((department) => [department.name, department]),
  );

  const ownerDepartmentIds = [
    departmentsByName.get('Reception')?.id,
    departmentsByName.get('Production')?.id,
    departmentsByName.get('Disbursement')?.id,
    departmentsByName.get('Store')?.id,
  ].filter((id): id is string => Boolean(id));

  // 5. Create membership
  const [membership] = await db
    .insert(schema.tenantMemberships)
    .values({
      tenantId: tenant.id,
      authUserId: userId,
      displayName: 'Bakery Owner',
      roleKey: 'OWNER',
      status: 'ACTIVE',
    })
    .returning();

  await db.insert(schema.membershipBranches).values({
    tenantId: tenant.id,
    membershipId: membership.id,
    branchId: branch.id,
  });

  await db.insert(schema.membershipDepartments).values(
    ownerDepartmentIds.map((departmentId) => ({
      tenantId: tenant.id,
      membershipId: membership.id,
      departmentId,
    })),
  );

  // 6. Seed default role permissions for the tenant
  const defaultRolePermissions = Object.entries(DEFAULT_ROLE_PERMISSIONS).flatMap(
    ([roleKey, permissions]) =>
      permissions.map((permissionKey) => ({
        tenantId: tenant.id,
        roleKey,
        permissionKey,
      })),
  );

  if (defaultRolePermissions.length > 0) {
    await db.insert(schema.rolePermissions).values(defaultRolePermissions);
  }

  // 7. Create catalog item
  await db.insert(schema.catalogItems).values({
    tenantId: tenant.id,
    itemType: 'FINISHED_GOOD',
    sku: 'CROISSANT-01',
    name: 'Butter Croissant',
    normalizedName: 'butter croissant',
    category: 'Viennoiserie',
    uom: 'EACH',
    sellingPrice: '4.5000',
    currency: 'USD',
    status: 'ACTIVE',
  });

  // 8. Create supplier
  await db.insert(schema.suppliers).values({
    tenantId: tenant.id,
    name: 'French Butter Mills',
    normalizedName: 'french butter mills',
    contactEmail: 'orders@butter.com',
    status: 'ACTIVE',
  });

  // 9. Create customer
  await db.insert(schema.customers).values({
    tenantId: tenant.id,
    displayName: 'Grand Cafe',
    normalizedName: 'grand cafe',
    email: 'accounts@grandcafe.com',
    creditCeiling: '1000.0000',
    currency: 'USD',
    status: 'ACTIVE',
  });

  console.log('Seed completed successfully for tenant:', tenant.id);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
