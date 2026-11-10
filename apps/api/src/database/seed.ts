import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.js';

const connectionString =
  process.env.MIGRATION_DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/tallybakery';

const pool = new pg.Pool({ connectionString });
const db = drizzle(pool, { schema });

async function seed() {
  console.log('Starting seed...');

  // 1. Create default owner user
  const [user] = await db
    .insert(schema.user)
    .values({
      name: 'Bakery Owner',
      email: 'owner@tallybakery.local',
      emailVerified: true,
      role: 'owner',
    })
    .onConflictDoNothing()
    .returning();

  const userId = user ? user.id : (await db.query.user.findFirst())?.id;
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

  // 4. Create department
  const [dept] = await db
    .insert(schema.departments)
    .values({
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'Pastry Kitchen',
      type: 'PRODUCTION',
      status: 'ACTIVE',
    })
    .returning();

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

  await db.insert(schema.membershipDepartments).values({
    tenantId: tenant.id,
    membershipId: membership.id,
    departmentId: dept.id,
  });

  // 6. Create catalog item
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

  // 7. Create supplier
  await db.insert(schema.suppliers).values({
    tenantId: tenant.id,
    name: 'French Butter Mills',
    normalizedName: 'french butter mills',
    contactEmail: 'orders@butter.com',
    status: 'ACTIVE',
  });

  // 8. Create customer
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
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
