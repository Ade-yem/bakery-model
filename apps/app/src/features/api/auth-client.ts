import type {
  AuthClient,
  AccountSession,
  StaffSession,
  AuthenticatedSession,
  Department,
  WorkspaceChoice,
} from '../integration/auth';
import { ApiError, type ApiClient } from './http';
import {
  parseCookieSession,
  parseIdentity,
  parseBranch,
  parseDepartment,
  rows,
  text,
  record,
  invalid,
  type Identity,
} from './contracts';
const selectionKey = 'cadence:workspace-selection:v1';
interface Selection {
  userId: string;
  tenantId: string;
  branchId: string;
  departmentId: string;
}
export function departmentKind(type: string): Department | null {
  const kinds: Record<string, Department> = {
    PRODUCTION: 'production',
    RECEPTION: 'reception',
    DISPATCH: 'disbursement',
    STORE: 'procurement',
  };
  return kinds[type] ?? null;
}
/** Scope selectors are conveniences only: the server checks them on every protected request. */
export function createAuthClient(
  api: ApiClient,
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = null
): AuthClient {
  let selection: Selection | null = null;
  let readSavedSelection = true;
  async function identity() {
    const cookie = parseCookieSession(await api.request('/api/auth/get-session'));
    if (!cookie || cookie.expiresAt <= Date.now()) return null;
    const me = parseIdentity(await api.request('/api/v1/me'));
    if (me.user.id !== cookie.user.id) throw invalid();
    return { me, expiresAt: cookie.expiresAt };
  }
  function account(me: Identity, expiresAt: number): AccountSession {
    return {
      userId: me.user.id,
      email: me.user.email,
      displayName: me.user.name,
      role: me.activeContext?.role ?? 'UNASSIGNED',
      tenantId: me.activeContext?.tenantId ?? '',
      tenantName: null,
      branchId: '',
      branchName: '',
      department: null,
      expiresAt,
      accountStatus:
        !me.activeContext && me.memberships.length
          ? me.memberships.some((membership) => membership.status === 'SUSPENDED')
            ? 'SUSPENDED'
            : 'INACTIVE'
          : 'ACTIVE',
      subscriptionStatus: 'UNKNOWN',
      permissions: me.activeContext?.permissions ?? [],
      enabledModules: [],
      planModules: [],
    };
  }
  async function choices(me: Identity) {
    if (!me.activeContext) return { branches: [], departments: [] };
    const tenantId = me.activeContext.tenantId,
      scope = { tenantId };
    if (
      !me.activeContext.permissions.includes('branches:read') ||
      !me.activeContext.permissions.includes('departments:read')
    )
      return { branches: [], departments: [] };
    const [branches, departments] = await Promise.all([
      api.request('/api/v1/branches', { scope }).then((v) => rows(v, parseBranch)),
      api.request('/api/v1/departments', { scope }).then((v) => rows(v, parseDepartment)),
    ]);
    if (
      branches.some((b) => b.tenantId !== tenantId) ||
      departments.some((d) => d.tenantId !== tenantId)
    )
      throw invalid();
    return {
      branches: branches.filter((b) => b.status === 'ACTIVE'),
      departments: departments.filter((d) => d.status === 'ACTIVE'),
    };
  }
  async function resolveSelection(
    me: Identity,
    expiresAt: number,
    chosen: Selection
  ): Promise<StaffSession> {
    if (
      !me.activeContext ||
      chosen.userId !== me.user.id ||
      chosen.tenantId !== me.activeContext.tenantId
    )
      throw new ApiError(
        403,
        'SCOPE_FORBIDDEN',
        'This workspace belongs to another account or business.'
      );
    const { branches, departments } = await choices(me);
    const branch = branches.find((b) => b.id === chosen.branchId),
      department = departments.find(
        (d) => d.id === chosen.departmentId && d.branchId === chosen.branchId
      );
    const kind = department ? departmentKind(department.type) : null;
    if (!branch || !department || !kind)
      throw new ApiError(403, 'SCOPE_FORBIDDEN', 'This workspace is unavailable for your account.');
    // TenantScopeGuard validates the chosen branch and department before any view is opened.
    await api.request('/api/v1/departments', {
      scope: { tenantId: chosen.tenantId, branchId: branch.id, departmentId: department.id },
    });
    return {
      ...account(me, expiresAt),
      branchId: branch.id,
      branchName: branch.name,
      department: kind,
      departmentId: department.id,
      departmentName: department.name,
    };
  }
  async function getSession(): Promise<AuthenticatedSession | null> {
    const current = await identity();
    if (!current) return null;
    let chosen = selection;
    if (!chosen && storage && readSavedSelection) {
      try {
        const saved = JSON.parse(storage.getItem(selectionKey) ?? 'null');
        if (
          saved &&
          ['userId', 'tenantId', 'branchId', 'departmentId'].every(
            (k) => typeof saved[k] === 'string'
          )
        )
          chosen = saved;
      } catch {
        /* Invalid selectors cannot establish a session. */
      }
    }
    if (
      chosen &&
      chosen.userId === current.me.user.id &&
      chosen.tenantId === current.me.activeContext?.tenantId
    ) {
      try {
        return await resolveSelection(current.me, current.expiresAt, chosen);
      } catch (error) {
        if (!(error instanceof ApiError) || ![403, 404].includes(error.status)) throw error;
        selection = null;
        try {
          storage?.removeItem(selectionKey);
        } catch {
          /* Scope will be selected again. */
        }
      }
    }
    return account(current.me, current.expiresAt);
  }
  return {
    getSession,
    passwordResetAvailable: false,
    clearWorkspace() {
      selection = null;
      readSavedSelection = false;
      try {
        storage?.removeItem(selectionKey);
      } catch {
        /* Current selection is no longer active in memory. */
      }
    },
    async signIn(email, password) {
      await api.request('/api/auth/sign-in/email', {
        method: 'POST',
        body: { email: email.trim(), password, rememberMe: false },
      });
      const session = await getSession();
      if (!session)
        throw new ApiError(
          401,
          'SESSION_UNAVAILABLE',
          'Sign-in could not be restored. Check that cookies are allowed and try again.'
        );
      return session;
    },
    async signOut() {
      const result = record(await api.request('/api/auth/sign-out', { method: 'POST', body: {} }));
      if (result.success !== true) throw invalid();
      selection = null;
      readSavedSelection = false;
      try {
        storage?.removeItem(selectionKey);
      } catch {
        /* Server session has already been invalidated. */
      }
    },
    async register(values) {
      const result = record(
        await api.request('/api/auth/sign-up/email', {
          method: 'POST',
          body: {
            name: values.fullName.trim(),
            email: values.email.trim(),
            password: values.password,
          },
        })
      );
      if (text(record(result.user).email).toLowerCase() !== values.email.trim().toLowerCase())
        throw invalid();
    },
    async requestPasswordReset() {
      throw new ApiError(
        503,
        'RESET_UNAVAILABLE',
        'Password reset is currently unavailable. Contact your business administrator.'
      );
    },
    async workspaces(): Promise<WorkspaceChoice[]> {
      const current = await identity();
      if (!current) throw new ApiError(401, 'AUTH_REQUIRED', 'Please sign in again.');
      const { branches, departments } = await choices(current.me);
      return branches.map((b) => ({
        branchId: b.id,
        branchName: b.name,
        departments: departments
          .filter((d) => d.branchId === b.id && departmentKind(d.type))
          .map((d) => ({ id: d.id, name: d.name, department: departmentKind(d.type)! })),
      }));
    },
    async selectWorkspace(branchId, departmentId) {
      const current = await identity();
      if (!current || !current.me.activeContext)
        throw new ApiError(401, 'AUTH_REQUIRED', 'Please sign in again.');
      const chosen = {
        userId: current.me.user.id,
        tenantId: current.me.activeContext.tenantId,
        branchId,
        departmentId,
      };
      const session = await resolveSelection(current.me, current.expiresAt, chosen);
      selection = chosen;
      try {
        storage?.setItem(selectionKey, JSON.stringify(chosen));
      } catch {
        /* Selection remains in memory for this visit. */
      }
      return session;
    },
    async onboardBusiness(name) {
      const current = await identity();
      if (!current) throw new ApiError(401, 'AUTH_REQUIRED', 'Please sign in again.');
      if (current.me.activeContext) return account(current.me, current.expiresAt);
      if (current.me.memberships.length)
        throw new ApiError(
          403,
          'ACCOUNT_UNAVAILABLE',
          'Your business membership is inactive. Contact your administrator.'
        );
      const result = await api.request('/api/v1/tenants', {
        method: 'POST',
        body: { name: name.trim() },
      });
      try {
        const tenantId = text(record(record(result).tenant).id);
        const refreshed = await getSession();
        if (!refreshed || refreshed.tenantId !== tenantId) throw invalid();
        return refreshed;
      } catch {
        throw invalid(true);
      }
    },
  };
}
