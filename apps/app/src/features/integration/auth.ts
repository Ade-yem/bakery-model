import { createContext, useContext } from 'react';
import type { RegisterFormValues } from '../../types';

export type Department = 'production' | 'reception' | 'disbursement' | 'procurement';
export interface StaffSession {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  tenantId: string;
  tenantName: string | null;
  branchId: string;
  branchName: string;
  department: Department;
  expiresAt: number;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'UNKNOWN';
  departmentId?: string;
  departmentName?: string;
  enabledModules: string[];
  planModules: string[];
  permissions: string[];
}
export type AccountSession = Omit<StaffSession, 'department'> & { department: null };
export type AuthenticatedSession = StaffSession | AccountSession;
export interface WorkspaceChoice {
  branchId: string;
  branchName: string;
  departments: { id: string; name: string; department: Department }[];
}
/** Implement with the team's authenticated transport; never persist a session token here. */
export interface AuthClient {
  getSession(): Promise<AuthenticatedSession | null>;
  signIn(identifier: string, password: string): Promise<AuthenticatedSession>;
  passwordResetAvailable?: boolean;
  clearWorkspace?: () => void;
  workspaces?(): Promise<WorkspaceChoice[]>;
  selectWorkspace?(branchId: string, departmentId: string): Promise<StaffSession>;
  onboardBusiness?(name: string): Promise<AuthenticatedSession>;
  signOut(): Promise<void>;
  register(values: RegisterFormValues, plan: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}
export function requireAuthClient(client: AuthClient | null): AuthClient {
  if (!client) throw new Error('Sign-in is currently unavailable. Please try again later.');
  return client;
}
export function validateSession(value: unknown): AuthenticatedSession | null {
  if (value === null) return null;
  if (!value || typeof value !== 'object') throw new Error('The session could not be verified.');
  const session = value as AuthenticatedSession;
  if (
    (session.department !== null &&
      !['production', 'reception', 'disbursement', 'procurement'].includes(session.department)) ||
    ['userId', 'email', 'displayName', 'role', 'tenantId', 'branchId', 'branchName'].some(
      (key) =>
        typeof session[key as keyof StaffSession] !== 'string' ||
        ((['userId', 'email', 'displayName'].includes(key) || session.department !== null) &&
          !String(session[key as keyof StaffSession]).trim())
    ) ||
    (session.tenantName !== null && typeof session.tenantName !== 'string') ||
    !Number.isFinite(session.expiresAt) ||
    !['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(session.accountStatus) ||
    !['ACTIVE', 'PAST_DUE', 'EXPIRED', 'UNKNOWN'].includes(session.subscriptionStatus) ||
    ['enabledModules', 'planModules', 'permissions'].some((key) => {
      const entries = session[key as 'permissions'];
      return !Array.isArray(entries) || !entries.every((entry) => typeof entry === 'string');
    })
  )
    throw new Error('The session could not be verified. Please sign in again.');
  return session;
}
export interface AuthState {
  status: 'unavailable' | 'loading' | 'ready' | 'error';
  session: AuthenticatedSession | null;
  client: AuthClient | null;
  error?: string;
  refresh: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<AuthenticatedSession>;
  selectWorkspace?: (branchId: string, departmentId: string) => Promise<void>;
  onboardBusiness?: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const unavailable = async (): Promise<never> => {
  throw new Error('Sign-in is currently unavailable. Please try again later.');
};
export const AuthContext = createContext<AuthState>({
  status: 'unavailable',
  session: null,
  client: null,
  refresh: unavailable,
  signIn: unavailable,
  signOut: unavailable,
});
export const useAuth = () => useContext(AuthContext);
