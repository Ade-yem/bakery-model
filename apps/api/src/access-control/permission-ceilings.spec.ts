import { describe, expect, it } from 'vitest';
import {
  PERMISSION_KEYS,
  ROLE_CEILINGS,
  VALID_PERMISSIONS,
  type PermissionKey,
} from './permissions.js';

describe('Phase 3.3 Permission Catalogue & Role Ceilings', () => {
  // TEST-W1-ACCESS-009 — Unknown permission rejected
  it('TEST-W1-ACCESS-009: rejects unknown permission keys', () => {
    expect(VALID_PERMISSIONS.has(PERMISSION_KEYS.ITEMS_READ)).toBe(true);
    expect(VALID_PERMISSIONS.has('unknown:fake:perm' as PermissionKey)).toBe(false);
  });

  // TEST-W1-ACCESS-010 — Role ceiling enforced
  it('TEST-W1-ACCESS-010: Production and Dispatch ceilings strictly exclude financial and customer contact permissions', () => {
    const prodCeiling = ROLE_CEILINGS['PRODUCTION_SUPERVISOR'];
    expect(prodCeiling).toBeDefined();
    expect(prodCeiling.has(PERMISSION_KEYS.ITEMS_PRICE_READ)).toBe(false);
    expect(prodCeiling.has(PERMISSION_KEYS.CUSTOMERS_READ)).toBe(false);
    expect(prodCeiling.has(PERMISSION_KEYS.CUSTOMERS_CONTACT_READ)).toBe(false);

    const disbCeiling = ROLE_CEILINGS['DISPATCH_OFFICER'];
    expect(disbCeiling).toBeDefined();
    expect(disbCeiling.has(PERMISSION_KEYS.ITEMS_PRICE_READ)).toBe(false);
    expect(disbCeiling.has(PERMISSION_KEYS.CUSTOMERS_READ)).toBe(false);
    expect(disbCeiling.has(PERMISSION_KEYS.CUSTOMERS_CONTACT_READ)).toBe(false);
  });

  it('TEST-W1-ACCESS-010 (part 2): Manager ceiling allows branch management but not Owner escalation', () => {
    const managerCeiling = ROLE_CEILINGS['MANAGER'];
    expect(managerCeiling.has(PERMISSION_KEYS.BRANCHES_MANAGE)).toBe(true);
    expect(managerCeiling.has(PERMISSION_KEYS.ROLES_MANAGE)).toBe(false);
    expect(managerCeiling.has(PERMISSION_KEYS.TENANT_UPDATE)).toBe(false);
  });
});
