/**
 * @file Unit tests for Client Admin permission resolution and subscription checks.
 */

import { describe, it, expect } from 'vitest';
import {
  hasClientPermission,
  hasAllClientPermissions,
  isModuleSubscribed,
  isMultiBranchSupported,
  CLIENT_PERMISSIONS,
} from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { BusinessSubscriptionSnapshot } from '../types';

describe('Client Admin Permissions & Subscription Gates', () => {
  const mockActor: AuthenticatedActor = {
    id: 'user-biz-1',
    fullName: 'Adaeze Okonkwo',
    email: 'adaeze@goldencrust.ng',
    designation: 'Bakery Operations Director',
    permissions: [
      CLIENT_PERMISSIONS.OVERVIEW_VIEW,
      CLIENT_PERMISSIONS.PROFILE_VIEW,
      CLIENT_PERMISSIONS.PROFILE_EDIT,
      CLIENT_PERMISSIONS.DEPARTMENTS_VIEW,
      CLIENT_PERMISSIONS.DEPARTMENTS_MANAGE,
      CLIENT_PERMISSIONS.INVENTORY_VIEW,
    ],
  };

  const starterSubscription: BusinessSubscriptionSnapshot = {
    planId: 'plan-starter-m',
    planName: 'Starter Monthly',
    tier: 'STARTER',
    status: 'active',
    currentPeriodEnd: '2026-12-31',
    maxBranches: 1,
    maxStaff: 5,
    maxDepartments: 2,
    enabledModules: ['sales'],
    isMultiBranchSupported: false,
  };

  const businessSubscription: BusinessSubscriptionSnapshot = {
    planId: 'plan-business-m',
    planName: 'Business Monthly',
    tier: 'GROWTH',
    status: 'active',
    currentPeriodEnd: '2026-12-31',
    maxBranches: 5,
    maxStaff: 40,
    maxDepartments: 8,
    enabledModules: ['inventory', 'sales', 'orders', 'production', 'procurement', 'payments', 'credits'],
    isMultiBranchSupported: true,
  };

  describe('hasClientPermission', () => {
    it('returns true when actor holds the permission', () => {
      expect(hasClientPermission(mockActor, CLIENT_PERMISSIONS.PROFILE_EDIT)).toBe(true);
    });

    it('returns false when actor lacks the permission', () => {
      expect(hasClientPermission(mockActor, CLIENT_PERMISSIONS.STAFF_MANAGE)).toBe(false);
    });

    it('returns false when actor is undefined', () => {
      expect(hasClientPermission(undefined, CLIENT_PERMISSIONS.PROFILE_VIEW)).toBe(false);
    });
  });

  describe('hasAllClientPermissions', () => {
    it('returns true when all required permissions are present', () => {
      expect(
        hasAllClientPermissions(mockActor, [
          CLIENT_PERMISSIONS.OVERVIEW_VIEW,
          CLIENT_PERMISSIONS.DEPARTMENTS_VIEW,
        ])
      ).toBe(true);
    });

    it('returns false when any required permission is missing', () => {
      expect(
        hasAllClientPermissions(mockActor, [
          CLIENT_PERMISSIONS.OVERVIEW_VIEW,
          CLIENT_PERMISSIONS.ROLES_MANAGE,
        ])
      ).toBe(false);
    });
  });

  describe('isModuleSubscribed', () => {
    it('returns true when module is present in enabledModules', () => {
      expect(isModuleSubscribed(businessSubscription, 'production')).toBe(true);
    });

    it('returns false when module is omitted from subscription', () => {
      expect(isModuleSubscribed(starterSubscription, 'production')).toBe(false);
    });

    it('returns false when subscription is undefined', () => {
      expect(isModuleSubscribed(undefined, 'sales')).toBe(false);
    });
  });

  describe('isMultiBranchSupported', () => {
    it('returns true for multi-branch plans with maxBranches > 1', () => {
      expect(isMultiBranchSupported(businessSubscription)).toBe(true);
    });

    it('returns false for single branch plans', () => {
      expect(isMultiBranchSupported(starterSubscription)).toBe(false);
    });

    it('returns false when subscription is undefined', () => {
      expect(isMultiBranchSupported(undefined)).toBe(false);
    });
  });
});
