/** Cookie-based API transport. No tokens are read, persisted or copied into headers. */
export const API_ORIGIN = 'https://cadence-api-4gni.onrender.com';
export interface ApiScope {
  tenantId: string;
  branchId?: string;
  departmentId?: string;
}
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly outcomeUnknown: boolean;
  constructor(status: number, code: string, message: string, outcomeUnknown = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.outcomeUnknown = outcomeUnknown;
  }
}
const messages: Record<string, string> = {
  AUTH_REQUIRED: 'Your session has expired. Please sign in again.',
  INVALID_EMAIL_OR_PASSWORD: 'The email or password is incorrect.',
  USER_ALREADY_EXISTS: 'An account with this email already exists. Please sign in.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'An account with this email already exists. Please sign in.',
  INVALID_PASSWORD: 'The password is incorrect.',
  SCOPE_FORBIDDEN: 'You do not have access to this workspace.',
  ACTIVE_TENANT_REQUIRED: 'An active business membership is required.',
  ROLE_ASSIGNMENT_FORBIDDEN: 'Your assigned access does not allow this action.',
  RESOURCE_NOT_FOUND: 'This record is unavailable in your workspace.',
  CONFLICT: 'This record already exists or has changed. Refresh before continuing.',
  VALIDATION_FAILED: 'Some details were not accepted. Review the form and try again.',
  INVALID_ORIGIN:
    'This application address is not authorized for sign-in. Contact your administrator.',
};
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  scope?: ApiScope;
  signal?: AbortSignal;
}
export interface ApiClient {
  request(path: string, options?: RequestOptions): Promise<unknown>;
}
export function createApiClient({
  fetcher = globalThis.fetch,
  baseUrl = '',
  timeoutMs = 30000,
}: { fetcher?: typeof fetch; baseUrl?: string; timeoutMs?: number } = {}): ApiClient {
  if (baseUrl) {
    const url = new URL(baseUrl);
    if (
      url.protocol !== 'https:' &&
      !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
    )
      throw new Error('The API must use HTTPS.');
    if (url.username || url.password || url.search || url.hash)
      throw new Error('Invalid API address.');
  }
  return {
    async request(path, { method = 'GET', body, scope, signal } = {}) {
      if (!/^\/api\/(?:auth|v1)(?:\/|$)/.test(path) || path.includes('..') || path.includes('#'))
        throw new Error('Invalid API request path.');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (scope) {
        headers['x-tenant-id'] = scope.tenantId;
        if (scope.branchId) headers['x-branch-id'] = scope.branchId;
        if (scope.departmentId) headers['x-department-id'] = scope.departmentId;
      }
      const controller = new AbortController();
      const abort = () => controller.abort();
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) controller.abort();
      const timer = setTimeout(abort, timeoutMs);
      try {
        const response = await fetcher(`${baseUrl.replace(/\/$/, '')}${path}`, {
          method,
          headers,
          credentials: 'include',
          cache: 'no-store',
          redirect: 'error',
          signal: controller.signal,
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
        const raw = await response.text();
        let value: unknown = null;
        try {
          value = raw ? JSON.parse(raw) : null;
        } catch {
          throw new ApiError(
            response.status,
            'INVALID_RESPONSE',
            'The service returned an unreadable response. Please retry.',
            method !== 'GET'
          );
        }
        if (!response.ok) {
          const record =
            value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
          const code = typeof record.code === 'string' ? record.code : 'REQUEST_FAILED';
          const fallback =
            response.status === 401
              ? 'Please sign in to continue.'
              : response.status === 403
                ? 'Your account does not have access to this action.'
                : response.status === 409
                  ? messages.CONFLICT
                  : response.status >= 500
                    ? 'The service is temporarily unavailable. Please try again later.'
                    : 'The request was not accepted. Review your details and try again.';
          throw new ApiError(
            response.status,
            code,
            messages[code] ?? fallback,
            method !== 'GET' && response.status >= 500
          );
        }
        return value;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        if (signal?.aborted) throw new DOMException('The request was cancelled.', 'AbortError');
        throw new ApiError(
          0,
          'CONNECTION_FAILED',
          method === 'GET'
            ? 'Unable to reach the service. Check your connection and retry.'
            : 'The result could not be confirmed. Check the current records before submitting again.',
          method !== 'GET'
        );
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
      }
    },
  };
}
