// Standard Week 1 Error Codes
export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  SESSION_INVALID: 'SESSION_INVALID',
  ACTIVE_TENANT_REQUIRED: 'ACTIVE_TENANT_REQUIRED',
  SCOPE_FORBIDDEN: 'SCOPE_FORBIDDEN',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  IDEMPOTENCY_KEY_REUSED: 'IDEMPOTENCY_KEY_REUSED',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  LAST_OWNER_REQUIRED: 'LAST_OWNER_REQUIRED',
  ROLE_ASSIGNMENT_FORBIDDEN: 'ROLE_ASSIGNMENT_FORBIDDEN',
  UNKNOWN_PERMISSION: 'UNKNOWN_PERMISSION',
  DEPENDENCY_UNAVAILABLE: 'DEPENDENCY_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface StandardErrorResponse {
  code: string;
  message: string;
  requestId: string;
  details?: Record<string, unknown> | Array<unknown>;
}

// Bounded Cursor Pagination Contract
export interface CursorPageMeta {
  limit: number;
  nextCursor: string | null;
}

export interface CursorPage<T> {
  data: T[];
  page: CursorPageMeta;
}

export interface CursorPaginationParams {
  limit?: number;
  cursor?: string;
}

// Roles & Status Enums
export const ROLE_KEYS = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  PRODUCTION: 'PRODUCTION',
  RECEPTION: 'RECEPTION',
  DISBURSEMENT: 'DISBURSEMENT',
} as const;

export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS];

export const STATUS_KEYS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  INVITED: 'INVITED',
} as const;

export type StatusKey = (typeof STATUS_KEYS)[keyof typeof STATUS_KEYS];

// Unit of Measure Allowlist
export const UOM_KEYS = {
  EACH: 'EACH',
  GRAM: 'GRAM',
  KILOGRAM: 'KILOGRAM',
  MILLILITRE: 'MILLILITRE',
  LITRE: 'LITRE',
  BAG: 'BAG',
} as const;

export type UomKey = (typeof UOM_KEYS)[keyof typeof UOM_KEYS];

// User and General Response DTOs
export interface UserDto {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  error: string | null;
  success: boolean;
}
