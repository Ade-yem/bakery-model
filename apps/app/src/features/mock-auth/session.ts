/** Demo UI access only. Never accepted as authentication by the API. */
export const DEMO_PASSWORD = 'TallyDemo2026!';
export const DEMO_SESSION_KEY = 'tallybakery:demo-session:v1';
export type DemoDepartment = 'production' | 'reception' | 'disbursement' | 'procurement';
export interface DemoSession {
  department: DemoDepartment;
  expiresAt: number;
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  subscriptionStatus?: 'ACTIVE' | 'PAST_DUE' | 'EXPIRED';
  enabledModules?: string[];
  planModules?: string[];
  permissions?: string[];
}
export function authenticateDemo(identifier: string, password: string): DemoSession | null {
  const department = identifier.trim().toLowerCase().replace('@demo.tallybakery.test', '');
  if (
    identifier.trim().toLowerCase() !== `${department}@demo.tallybakery.test` ||
    !['production', 'reception', 'disbursement', 'procurement'].includes(department) ||
    password !== DEMO_PASSWORD
  )
    return null;
  return { department: department as DemoDepartment, expiresAt: Date.now() + 8 * 60 * 60 * 1000 };
}
export function readDemoSession(raw: string | null): DemoSession | null {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (
      value &&
      ['production', 'reception', 'disbursement', 'procurement'].includes(value.department) &&
      typeof value.expiresAt === 'number' &&
      Number.isFinite(value.expiresAt) &&
      value.expiresAt > Date.now()
    ) {
      if (
        value.accountStatus !== undefined &&
        !['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(value.accountStatus)
      )
        return null;
      if (
        value.subscriptionStatus !== undefined &&
        !['ACTIVE', 'PAST_DUE', 'EXPIRED'].includes(value.subscriptionStatus)
      )
        return null;
      if (
        ['enabledModules', 'permissions', 'planModules'].some(
          (key) =>
            value[key] !== undefined &&
            (!Array.isArray(value[key]) ||
              value[key].length > 100 ||
              value[key].some((entry: unknown) => typeof entry !== 'string'))
        )
      )
        return null;
      return {
        department: value.department,
        expiresAt: value.expiresAt,
        ...(value.accountStatus ? { accountStatus: value.accountStatus } : {}),
        ...(value.subscriptionStatus ? { subscriptionStatus: value.subscriptionStatus } : {}),
        ...(value.enabledModules ? { enabledModules: value.enabledModules } : {}),
        ...(value.planModules ? { planModules: value.planModules } : {}),
        ...(value.permissions ? { permissions: value.permissions } : {}),
      };
    }
  } catch {
    /* Invalid demo data is treated as signed out. */
  }
  return null;
}

/** Separate mock identity for incoming verification; does not create or replace a session. */
export function verifyIncoming(
  department: DemoDepartment,
  email: string,
  password: string
): string {
  const identity = email.trim().toLowerCase();
  if (
    !['reception', 'disbursement'].includes(department) ||
    identity !== `${department}.incoming@demo.tallybakery.test` ||
    password !== DEMO_PASSWORD
  )
    throw new Error('Incoming verification credentials are invalid for this department.');
  return identity;
}

export function isExpiredSession(raw: string | null, now: number): boolean {
  try {
    const value = JSON.parse(raw ?? 'null');
    return Boolean(
      value &&
      typeof value.expiresAt === 'number' &&
      Number.isFinite(value.expiresAt) &&
      value.expiresAt <= now
    );
  } catch {
    return false;
  }
}
