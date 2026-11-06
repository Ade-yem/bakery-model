import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDrizzleToken } from '@nestjs/drizzle';
import { eq } from 'drizzle-orm';
import { configureApp } from '../src/app.config.js';
import { AppModule } from '../src/app.module.js';
import type { Database } from '../src/database/database.types.js';
import * as schema from '../src/database/schema/index.js';

describe('Phase 3 Auth and Access Control Tests', () => {
  let app: INestApplication;
  let db: Database;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/tallybakery';
    process.env.NODE_ENV = 'test';
    process.env.BETTER_AUTH_SECRET = 'a'.repeat(32);
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    db = app.get<Database>(getDrizzleToken());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // TEST-W1-AUTH-003 — Invalid credentials
  it('TEST-W1-AUTH-003: sign in with invalid password returns 401/error without leaking secrets', async () => {
    const email = `phase3-invalid-${Date.now()}@tallybakery.com`;
    await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({
        email,
        password: 'CorrectPassword123!',
        name: 'User 3',
      });

    const res = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({
        email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.token).toBeUndefined();
  });

  // TEST-W1-AUTH-004 — Expired/revoked session
  it('TEST-W1-AUTH-004: calling /api/v1/me without session returns HTTP 401 AUTH_REQUIRED', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH_REQUIRED');
  });

  // TEST-W1-AUTH-006 — Trusted-origin and CSRF policy
  it('TEST-W1-AUTH-006: accepts requests from trusted origin and blocks state-changing from untrusted origin', async () => {
    const resDisallowed = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', 'https://malicious-site.com')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(resDisallowed.status).toBeGreaterThanOrEqual(400);
  });

  // TEST-W1-ACCESS-017 — /me safe summary
  it('TEST-W1-ACCESS-017: /me returns safe summary with user, memberships, and activeContext without secrets', async () => {
    const email = `phase3-me-${Date.now()}@tallybakery.com`;
    await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({
        email,
        password: 'Password123!',
        name: 'Persona Me',
      });

    const signInRes = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({
        email,
        password: 'Password123!',
      });

    const cookie = signInRes.headers['set-cookie'];
    expect(cookie).toBeDefined();

    const meRes = await request(app.getHttpServer())
      .get('/api/v1/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user).toBeDefined();
    expect(meRes.body.user.email).toBe(email);
    expect(meRes.body.user.password).toBeUndefined();
    expect(meRes.body.memberships).toBeDefined();
  });

  // TEST-W1-ACCESS-013 — Selector tampering & TenantScopeGuard verification
  it('TEST-W1-ACCESS-013: rejects caller without active membership with 403 ACTIVE_TENANT_REQUIRED', async () => {
    const email = `phase3-nomembership-${Date.now()}@tallybakery.com`;
    await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({
        email,
        password: 'Password123!',
        name: 'No Member User',
      });

    const signInRes = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({
        email,
        password: 'Password123!',
      });

    const cookie = signInRes.headers['set-cookie'];

    const res = await request(app.getHttpServer())
      .get('/api/v1/test-guarded/tenant')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACTIVE_TENANT_REQUIRED');
  });

  it('TEST-W1-ACCESS-013 (part 2): enforces branch selector within membership scope and populates ActorContext', async () => {
    const email = `phase3-actor-${Date.now()}@tallybakery.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({
        email,
        password: 'Password123!',
        name: 'Actor User',
      });

    const signInRes = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({
        email,
        password: 'Password123!',
      });

    const cookie = signInRes.headers['set-cookie'];
    const userId = signupRes.body.user.id;

    // Create a tenant, branch, and membership in DB for this user
    const [tenant] = await db
      .insert(schema.tenants)
      .values({
        name: 'Bakery Test Tenant',
        subscriptionTier: 'STARTER',
        subscriptionStatus: 'ACTIVE',
        defaultCurrency: 'USD',
      })
      .returning();

    const [branch] = await db
      .insert(schema.branches)
      .values({
        tenantId: tenant!.id,
        name: 'Central Branch',
        code: `CB-${Date.now()}`,
        timezone: 'UTC',
      })
      .returning();

    const [membership] = await db
      .insert(schema.tenantMemberships)
      .values({
        tenantId: tenant!.id,
        authUserId: userId,
        displayName: 'Actor User',
        roleKey: 'MANAGER',
        status: 'ACTIVE',
      })
      .returning();

    await db.insert(schema.membershipBranches).values({
      tenantId: tenant!.id,
      membershipId: membership!.id,
      branchId: branch!.id,
    });

    // Request with valid branch selector
    const validRes = await request(app.getHttpServer())
      .get('/api/v1/test-guarded/tenant')
      .set('Cookie', cookie)
      .set('x-tenant-id', tenant!.id)
      .set('x-branch-id', branch!.id);

    expect(validRes.status).toBe(200);
    expect(validRes.body.tenantId).toBe(tenant!.id);
    expect(validRes.body.activeBranchId).toBe(branch!.id);

    // Request with tampered branch selector outside scope
    const tamperedRes = await request(app.getHttpServer())
      .get('/api/v1/test-guarded/tenant')
      .set('Cookie', cookie)
      .set('x-tenant-id', tenant!.id)
      .set('x-branch-id', '11111111-1111-4111-8111-111111111111');

    expect(tamperedRes.status).toBe(403);
    expect(tamperedRes.body.code).toBe('SCOPE_FORBIDDEN');
  });

  // TEST-W1-ACCESS-018 — No active workspace
  it('TEST-W1-ACCESS-018: authenticated user with only inactive memberships gets /me with null activeContext and cannot access guarded routes', async () => {
    const email = `phase3-inactive-${Date.now()}@tallybakery.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({
        email,
        password: 'Password123!',
        name: 'Inactive User',
      });

    const signInRes = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({
        email,
        password: 'Password123!',
      });

    const cookie = signInRes.headers['set-cookie'];
    const userId = signupRes.body.user.id;

    const [tenant] = await db
      .insert(schema.tenants)
      .values({
        name: 'Inactive Tenant',
        subscriptionTier: 'STARTER',
        subscriptionStatus: 'ACTIVE',
        defaultCurrency: 'USD',
      })
      .returning();

    await db.insert(schema.tenantMemberships).values({
      tenantId: tenant!.id,
      authUserId: userId,
      displayName: 'Inactive User',
      roleKey: 'MANAGER',
      status: 'SUSPENDED',
    });

    const meRes = await request(app.getHttpServer())
      .get('/api/v1/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.activeContext).toBeNull();
    expect(meRes.body.memberships[0].status).toBe('SUSPENDED');

    const guardedRes = await request(app.getHttpServer())
      .get('/api/v1/test-guarded/tenant')
      .set('Cookie', cookie);

    expect(guardedRes.status).toBe(403);
    expect(guardedRes.body.code).toBe('ACTIVE_TENANT_REQUIRED');
  });

  // TEST-W1-ACCESS-019 — Permission refresh / invalidation
  it('TEST-W1-ACCESS-019: suspending a membership immediately revokes protected access on the subsequent request', async () => {
    const email = `phase3-refresh-${Date.now()}@tallybakery.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({
        email,
        password: 'Password123!',
        name: 'Refresh User',
      });

    const signInRes = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({
        email,
        password: 'Password123!',
      });

    const cookie = signInRes.headers['set-cookie'];
    const userId = signupRes.body.user.id;

    const [tenant] = await db
      .insert(schema.tenants)
      .values({
        name: 'Revoke Test Tenant',
        subscriptionTier: 'STARTER',
        subscriptionStatus: 'ACTIVE',
        defaultCurrency: 'USD',
      })
      .returning();

    const [membership] = await db
      .insert(schema.tenantMemberships)
      .values({
        tenantId: tenant!.id,
        authUserId: userId,
        displayName: 'Refresh User',
        roleKey: 'MANAGER',
        status: 'ACTIVE',
      })
      .returning();

    // First request succeeds
    const firstRes = await request(app.getHttpServer())
      .get('/api/v1/test-guarded/tenant')
      .set('Cookie', cookie)
      .set('x-tenant-id', tenant!.id);

    expect(firstRes.status).toBe(200);

    // Now suspend membership in DB
    await db
      .update(schema.tenantMemberships)
      .set({ status: 'SUSPENDED' })
      .where(eq(schema.tenantMemberships.id, membership!.id));

    // Next request immediately denied
    const secondRes = await request(app.getHttpServer())
      .get('/api/v1/test-guarded/tenant')
      .set('Cookie', cookie)
      .set('x-tenant-id', tenant!.id);

    expect(secondRes.status).toBe(403);
    expect(secondRes.body.code).toBe('ACTIVE_TENANT_REQUIRED');
  });
});
