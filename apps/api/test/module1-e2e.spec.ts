import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configureApp } from '../src/app.config.js';
import { AppModule } from '../src/app.module.js';
import type { Database } from '../src/database/database.types.js';

describe('Module 1: Identity, Tenancy, Branch & Access Control (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/tallybakery';
    process.env.NODE_ENV = 'test';
    process.env.BETTER_AUTH_SECRET =
      'development-default-secret-min-32-characters-needed-now';
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // State shared across user flows
  let ownerEmail: string;
  let ownerCookie: string;
  let tenantId: string;
  let primaryBranchId: string;
  let secondaryBranchId: string;
  let receptionDeptId: string;
  let customDeptId: string;
  let staffMembershipId: string;
  let ownerMembershipId: string;

  // ---------------------------------------------------------------------------
  // 1. Full User Authentication
  // ---------------------------------------------------------------------------
  describe('1. Full User Authentication & Session Lifecycle', () => {
    it('TEST-E2E-AUTH-001: Sign up a new user via email and password', async () => {
      ownerEmail = `owner-${Date.now()}@tallybakery.com`;
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: ownerEmail,
          password: 'Password123!',
          name: 'Bakery Owner One',
        });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(ownerEmail);
    });

    it('TEST-E2E-AUTH-002: Sign in with valid credentials and receive session cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: ownerEmail,
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      const cookies = res.headers['set-cookie'] as unknown as
        string[] | undefined;
      expect(cookies).toBeDefined();
      expect(cookies && cookies.length).toBeGreaterThan(0);
      ownerCookie = cookies![0]!;
    });

    it('TEST-E2E-AUTH-003: Session lookup and identity discovery via /me', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/me')
        .set('Cookie', ownerCookie);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(ownerEmail);
      expect(res.body.user.password).toBeUndefined();
      expect(Array.isArray(res.body.memberships)).toBe(true);
      // Not onboarded yet, so activeContext should be null
      expect(res.body.activeContext).toBeNull();
    });

    it('TEST-E2E-AUTH-004: Sign out revokes session and subsequent /me returns 401', async () => {
      const signoutRes = await request(app.getHttpServer())
        .post('/api/auth/sign-out')
        .set('Cookie', ownerCookie);

      expect(signoutRes.status).toBe(200);

      const meRes = await request(app.getHttpServer())
        .get('/api/v1/me')
        .set('Cookie', ownerCookie);

      expect(meRes.status).toBe(401);
      expect(meRes.body.code).toBe('AUTH_REQUIRED');

      // Re-authenticate to continue subsequent tests
      const reSignIn = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: ownerEmail,
          password: 'Password123!',
        });
      ownerCookie = (reSignIn.headers['set-cookie'] as unknown as string[])[0]!;
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Business Onboarding & Baseline Template Seeding
  // ---------------------------------------------------------------------------
  describe('2. Business Onboarding with Default Departments & Roles', () => {
    it('TEST-E2E-ONBOARD-001: Onboards business, seeds default departments, roles, and owner membership', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tenants')
        .set('Cookie', ownerCookie)
        .send({
          name: 'Artisan Sourdough Bakery',
          branchName: 'Downtown Flagship',
        });

      expect(res.status).toBe(201);
      expect(res.body.tenant).toBeDefined();
      expect(res.body.tenant.name).toBe('Artisan Sourdough Bakery');
      expect(res.body.tenant.subscriptionTier).toBe('STANDARD');
      expect(res.body.tenant.subscriptionStatus).toBe('ACTIVE');

      tenantId = res.body.tenant.id;
      primaryBranchId = res.body.branch.id;
      ownerMembershipId = res.body.membership.id;

      // Verify baseline departments seeded: Reception, Production, Dispatch, Store
      const departments = res.body.departments as Array<{
        id: string;
        name: string;
        code: string;
        type: string;
      }>;
      expect(departments).toHaveLength(4);

      const codes = departments.map((d) => d.code);
      expect(codes).toContain('REC');
      expect(codes).toContain('PROD');
      expect(codes).toContain('DISP');
      expect(codes).toContain('STORE');

      receptionDeptId = departments.find((d) => d.code === 'REC')!.id;

      // Verify owner membership role
      expect(res.body.membership.roleKey).toBe('OWNER');
      expect(res.body.membership.status).toBe('ACTIVE');
    });

    it('TEST-E2E-ONBOARD-002: /me reflects active tenant context after onboarding', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/me')
        .set('Cookie', ownerCookie);

      expect(res.status).toBe(200);
      expect(res.body.activeContext).toBeDefined();
      expect(res.body.activeContext.tenantId).toBe(tenantId);
      expect(res.body.activeContext.role).toBe('OWNER');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Branch Creation & Settings
  // ---------------------------------------------------------------------------
  describe('3. Branch Creation & Management', () => {
    it('TEST-E2E-BRANCH-001: Creates a secondary branch and lists tenant branches', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/branches')
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId)
        .send({
          name: 'Airport Kiosk',
          code: 'AIR1',
          timezone: 'Africa/Lagos',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.name).toBe('Airport Kiosk');
      expect(createRes.body.code).toBe('AIR1');
      secondaryBranchId = createRes.body.id;

      const listRes = await request(app.getHttpServer())
        .get('/api/v1/branches')
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId);

      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body)).toBe(true);
      const branchIds = (listRes.body as Array<{ id: string }>).map(
        (b) => b.id,
      );
      expect(branchIds).toContain(primaryBranchId);
      expect(branchIds).toContain(secondaryBranchId);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Department Setup & Status Toggle
  // ---------------------------------------------------------------------------
  describe('4. Department Setup & Lifecycle', () => {
    it('TEST-E2E-DEPT-001: Creates custom department and toggles status to INACTIVE', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/departments')
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId)
        .send({
          branchId: secondaryBranchId,
          name: 'Specialty Pastry Lab',
          code: 'PASTRY',
          type: 'PRODUCTION',
          description: 'Specialty pastry & artisan confection floor',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.name).toBe('Specialty Pastry Lab');
      expect(createRes.body.status).toBe('ACTIVE');
      customDeptId = createRes.body.id;

      // Soft-deactivate the department
      const patchRes = await request(app.getHttpServer())
        .patch(`/api/v1/departments/${customDeptId}`)
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId)
        .send({
          status: 'INACTIVE',
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.status).toBe('INACTIVE');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Staff Addition, Scoping, Access Ceiling & Removal
  // ---------------------------------------------------------------------------
  describe('5. Staff Addition, Scoping & Removal Operations', () => {
    it('TEST-E2E-STAFF-001: Invites/adds a new staff member with RECEPTIONIST role and Reception department', async () => {
      const staffEmail = `cashier-${Date.now()}@tallybakery.com`;

      // First create user record in better auth so authUserId is valid
      const userRes = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: staffEmail,
          password: 'Password123!',
          name: 'Jane Cashier',
        });
      expect(userRes.status).toBe(200);
      const staffAuthUserId = userRes.body.user.id;

      // Add staff to tenant
      const res = await request(app.getHttpServer())
        .post('/api/v1/staff')
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId)
        .send({
          authUserId: staffAuthUserId,
          displayName: 'Jane Cashier',
          roleKey: 'RECEPTIONIST',
          branchIds: [primaryBranchId],
          departmentIds: [receptionDeptId],
          status: 'ACTIVE',
        });

      expect(res.status).toBe(201);
      expect(res.body.roleKey).toBe('RECEPTIONIST');
      expect(res.body.status).toBe('ACTIVE');
      staffMembershipId = res.body.id;

      // Verify staff listing
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/staff')
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId);

      expect(listRes.status).toBe(200);
      const ids = (listRes.body as Array<{ id: string }>).map((s) => s.id);
      expect(ids).toContain(staffMembershipId);
    });

    it('TEST-E2E-STAFF-002: Rejects assigning permissions exceeding RECEPTIONIST role ceiling', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/staff/${staffMembershipId}/access`)
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId)
        .send({
          roleKey: 'RECEPTIONIST',
          customPermissions: ['tenants:delete'], // Exceeds receptionist role ceiling
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/exceed role ceiling/i);
    });

    it('TEST-E2E-STAFF-003: Rejects assigning an INACTIVE department to staff membership', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/staff/${staffMembershipId}/access`)
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId)
        .send({
          roleKey: 'RECEPTIONIST',
          departmentIds: [customDeptId], // INACTIVE department
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot assign inactive department/i);
    });

    it('TEST-E2E-STAFF-004: Deactivates staff membership via status update endpoint', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/staff/${staffMembershipId}/status`)
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId)
        .send({
          status: 'INACTIVE',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('INACTIVE');
    });

    it('TEST-E2E-STAFF-005: Enforces last-owner invariant preventing deactivation or removal of last OWNER', async () => {
      // Attempt to deactivate owner
      const deactRes = await request(app.getHttpServer())
        .patch(`/api/v1/staff/${ownerMembershipId}/status`)
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId)
        .send({
          status: 'INACTIVE',
        });

      expect(deactRes.status).toBeGreaterThanOrEqual(400);
      expect(deactRes.body.message).toMatch(/last active owner/i);

      // Attempt to delete owner
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/v1/staff/${ownerMembershipId}`)
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId);

      expect(deleteRes.status).toBeGreaterThanOrEqual(400);
      expect(deleteRes.body.message).toMatch(/last active owner/i);
    });

    it('TEST-E2E-STAFF-006: Removes non-owner staff membership via DELETE endpoint', async () => {
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/v1/staff/${staffMembershipId}`)
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId);

      expect(deleteRes.status).toBe(200);

      // Verify removed from active staff list
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/staff')
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId);

      const activeIds = (listRes.body as Array<{ id: string; status: string }>)
        .filter((s) => s.status === 'ACTIVE')
        .map((s) => s.id);
      expect(activeIds).not.toContain(staffMembershipId);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Multi-Tenant & Cross-Department Security Isolation
  // ---------------------------------------------------------------------------
  describe('6. Multi-Tenant Boundary & Cross-Department Security', () => {
    let tenantBId: string;
    let tenantBOwnerCookie: string;

    it('TEST-E2E-SEC-001: Onboards a second tenant (Tenant B)', async () => {
      const emailB = `owner-b-${Date.now()}@tallybakery.com`;
      const signUpRes = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: emailB,
          password: 'Password123!',
          name: 'Owner B',
        });
      expect(signUpRes.status).toBe(200);

      const signInRes = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: emailB,
          password: 'Password123!',
        });
      tenantBOwnerCookie = (
        signInRes.headers['set-cookie'] as unknown as string[]
      )[0]!;

      const onboardRes = await request(app.getHttpServer())
        .post('/api/v1/tenants')
        .set('Cookie', tenantBOwnerCookie)
        .send({
          name: 'Bakery Beta',
          branchName: 'Beta HQ',
        });
      expect(onboardRes.status).toBe(201);
      tenantBId = onboardRes.body.tenant.id;
    });

    it('TEST-E2E-SEC-002: Tenant A owner cannot access Tenant B resources via spoofed header', async () => {
      // Owner A attempts to list branches of Tenant B
      const res = await request(app.getHttpServer())
        .get('/api/v1/branches')
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantBId);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ACTIVE_TENANT_REQUIRED');
    });

    it('TEST-E2E-SEC-003: Cross-tenant resource modification is blocked', async () => {
      // Owner A attempts to modify a department in Tenant B
      const listDeptRes = await request(app.getHttpServer())
        .get('/api/v1/departments')
        .set('Cookie', tenantBOwnerCookie)
        .set('x-tenant-id', tenantBId);
      const tenantBDeptId = (listDeptRes.body as Array<{ id: string }>)[0]!.id;

      // Caller A tries to patch Tenant B department
      const patchRes = await request(app.getHttpServer())
        .patch(`/api/v1/departments/${tenantBDeptId}`)
        .set('Cookie', ownerCookie)
        .set('x-tenant-id', tenantId)
        .send({ name: 'Tampered Name' });

      expect(patchRes.status).toBe(404);
    });
  });
});
