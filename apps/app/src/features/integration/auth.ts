import { createContext, useContext } from 'react';
import type { RegisterFormValues } from '../../types';

export type Department = 'production' | 'reception' | 'disbursement' | 'procurement';
export interface StaffSession {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  tenantId: string;
  tenantName: string;
  branchId: string;
  branchName: string;
  department: Department;
  expiresAt: number;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'EXPIRED';
  enabledModules: string[];
  planModules: string[];
  permissions: string[];
}
/** Implement with the team's authenticated transport; never persist a session token here. */
export interface AuthClient {
  getSession(): Promise<StaffSession | null>;
  signIn(identifier: string, password: string): Promise<StaffSession>;
  signOut(): Promise<void>;
  register(values: RegisterFormValues, plan: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}
export function requireAuthClient(client: AuthClient | null): AuthClient {
  if (!client) throw new Error('Sign-in is currently unavailable. Please try again later.');
  return client;
}
export function validateSession(value: unknown): StaffSession | null {
  if (value === null) return null;
  if (!value || typeof value !== 'object') throw new Error('The session could not be verified.');
  const session = value as StaffSession;
  if (
    !['production', 'reception', 'disbursement', 'procurement'].includes(session.department) ||
    [
      'userId',
      'email',
      'displayName',
      'role',
      'tenantId',
      'tenantName',
      'branchId',
      'branchName',
    ].some(
      (key) =>
        typeof session[key as keyof StaffSession] !== 'string' ||
        !String(session[key as keyof StaffSession]).trim()
    ) ||
    !Number.isFinite(session.expiresAt) ||
    !['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(session.accountStatus) ||
    !['ACTIVE', 'PAST_DUE', 'EXPIRED'].includes(session.subscriptionStatus) ||
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
  session: StaffSession | null;
  client: AuthClient | null;
  error?: string;
  refresh: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<StaffSession>;
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
