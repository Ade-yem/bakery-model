import type { StaffSession } from '../integration/auth';
import { ApiError, type ApiClient, type ApiScope } from './http';
import {
  rows,
  parseItem,
  parseSupplier,
  parseCustomer,
  invalid,
  type CatalogItem,
  type ApiSupplier,
  type ApiCustomer,
} from './contracts';
export interface ReferenceData {
  items: CatalogItem[] | null;
  suppliers: ApiSupplier[] | null;
  customers: ApiCustomer[] | null;
}
export function scopeFor(session: StaffSession): ApiScope {
  if (!session.tenantId || !session.branchId || !session.departmentId)
    throw new ApiError(403, 'SCOPE_FORBIDDEN', 'Select an authorized workspace first.');
  return {
    tenantId: session.tenantId,
    branchId: session.branchId,
    departmentId: session.departmentId,
  };
}
function requirePermission(session: StaffSession, permission: string) {
  if (session.expiresAt <= Date.now())
    throw new ApiError(401, 'AUTH_REQUIRED', 'Your session expired. Please sign in again.');
  if (!session.permissions.includes(permission))
    throw new ApiError(403, 'SCOPE_FORBIDDEN', 'Your assigned access does not allow this action.');
}
export async function loadReferenceData(
  api: ApiClient,
  session: StaffSession,
  signal?: AbortSignal
): Promise<ReferenceData> {
  const scope = scopeFor(session),
    can = (p: string) => session.permissions.includes(p);
  const verify = <T extends { tenantId: string }>(values: T[]) => {
    if (values.some((v) => v.tenantId !== session.tenantId)) throw invalid();
    return values;
  };
  const [items, suppliers, customers] = await Promise.all([
    can('items:read')
      ? api.request('/api/v1/items', { scope, signal }).then((v) =>
          verify(rows(v, parseItem))
            .filter((i) => i.status === 'ACTIVE')
            .filter((i) =>
              session.department === 'production' || session.department === 'procurement'
                ? i.itemType === 'RAW_MATERIAL'
                : i.itemType === 'FINISHED_GOOD'
            )
            .map((i) => ({
              ...i,
              ...(can('items:price:read') && session.department === 'reception'
                ? {}
                : { sellingPrice: null, currency: null }),
            }))
        )
      : null,
    session.department === 'procurement' && can('suppliers:read')
      ? api
          .request('/api/v1/suppliers', { scope, signal })
          .then((v) => verify(rows(v, parseSupplier)).filter((s) => s.status === 'ACTIVE'))
      : null,
    session.department === 'reception' && can('customers:read')
      ? api.request('/api/v1/customers', { scope, signal }).then((v) =>
          verify(rows(v, parseCustomer))
            .filter((c) => c.status === 'ACTIVE')
            .map((c) => ({
              ...c,
              ...(can('customers:contact:read') ? {} : { phone: null, email: null }),
            }))
        )
      : null,
  ]);
  return { items, suppliers, customers };
}
export interface SupplierInput {
  name: string;
  externalReference?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}
export interface CustomerInput {
  currency: string;
  displayName: string;
  externalReference?: string;
  phone?: string;
  email?: string;
}
function created<T extends { tenantId: string }>(
  value: unknown,
  parse: (value: unknown) => T,
  tenantId: string
): T {
  try {
    const result = parse(value);
    if (result.tenantId !== tenantId) throw invalid();
    return result;
  } catch {
    throw invalid(true);
  }
}
export async function createSupplier(
  api: ApiClient,
  session: StaffSession,
  input: SupplierInput
): Promise<ApiSupplier> {
  requirePermission(session, 'suppliers:manage');
  if (session.department !== 'procurement')
    throw new ApiError(403, 'SCOPE_FORBIDDEN', 'Supplier entry is unavailable in this department.');
  const scope = scopeFor(session);
  const body = {
    name: input.name.trim(),
    ...(input.externalReference?.trim()
      ? { externalReference: input.externalReference.trim() }
      : {}),
    ...(input.contactName?.trim() ? { contactName: input.contactName.trim() } : {}),
    ...(input.contactPhone?.trim() ? { contactPhone: input.contactPhone.trim() } : {}),
    ...(input.contactEmail?.trim() ? { contactEmail: input.contactEmail.trim() } : {}),
  };
  return created(
    await api.request('/api/v1/suppliers', { method: 'POST', scope, body }),
    parseSupplier,
    session.tenantId
  );
}
export async function createCustomer(
  api: ApiClient,
  session: StaffSession,
  input: CustomerInput
): Promise<ApiCustomer> {
  requirePermission(session, 'customers:manage');
  if (session.department !== 'reception')
    throw new ApiError(403, 'SCOPE_FORBIDDEN', 'Customer entry is unavailable in this department.');
  if (!/^[A-Z]{3}$/.test(input.currency))
    throw new ApiError(400, 'VALIDATION_FAILED', 'Enter a three-letter customer currency code.');
  const scope = scopeFor(session);
  const body = {
    displayName: input.displayName.trim(),
    currency: input.currency,
    ...(input.externalReference?.trim()
      ? { externalReference: input.externalReference.trim() }
      : {}),
    ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
    ...(input.email?.trim() ? { email: input.email.trim() } : {}),
  };
  return created(
    await api.request('/api/v1/customers', { method: 'POST', scope, body }),
    parseCustomer,
    session.tenantId
  );
}
