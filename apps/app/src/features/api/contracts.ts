import { ApiError } from './http';
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
  return value as Record<string, unknown>;
}
export function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw invalid();
  return value;
}
export function optionalText(value: unknown): string | null {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim()))
    return null;
  return text(value);
}
export function strings(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) throw invalid();
  return [...value];
}
export function rows<T>(value: unknown, parse: (row: unknown) => T): T[] {
  if (!Array.isArray(value) || value.length > 10000) throw invalid();
  return value.map(parse);
}
export function invalid(outcomeUnknown = false) {
  return new ApiError(
    502,
    'INVALID_RESPONSE',
    outcomeUnknown
      ? 'The result could not be verified. Check the current records before submitting again.'
      : 'The service response could not be verified. Please retry.',
    outcomeUnknown
  );
}
export interface ApiUser {
  id: string;
  email: string;
  name: string;
}
export function parseUser(value: unknown): ApiUser {
  const v = record(value);
  return { id: text(v.id), email: text(v.email), name: text(v.name) };
}
export interface Membership {
  id: string;
  tenantId: string;
  role: string;
  status: string;
}
export interface Identity {
  user: ApiUser;
  memberships: Membership[];
  activeContext: {
    tenantId: string;
    membershipId: string;
    role: string;
    permissions: string[];
  } | null;
}
export function parseIdentity(value: unknown): Identity {
  const v = record(value);
  const memberships = rows(v.memberships, (raw) => {
    const m = record(raw);
    return {
      id: text(m.id),
      tenantId: text(m.tenantId),
      role: text(m.role),
      status: text(m.status),
    };
  });
  const c = v.activeContext === null ? null : record(v.activeContext);
  const activeContext = c
    ? {
        tenantId: text(c.tenantId),
        membershipId: text(c.membershipId),
        role: text(c.role),
        permissions: strings(c.permissions),
      }
    : null;
  if (
    activeContext &&
    !memberships.some(
      (m) =>
        m.id === activeContext.membershipId &&
        m.tenantId === activeContext.tenantId &&
        m.role === activeContext.role &&
        m.status === 'ACTIVE'
    )
  )
    throw invalid();
  return { user: parseUser(v.user), memberships, activeContext };
}
export function parseCookieSession(value: unknown): { user: ApiUser; expiresAt: number } | null {
  if (value === null) return null;
  const v = record(value),
    session = record(v.session),
    user = parseUser(v.user);
  const expiresAt = Date.parse(text(session.expiresAt));
  if (!Number.isFinite(expiresAt) || text(session.userId) !== user.id) throw invalid();
  return { user, expiresAt };
}
export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  status: string;
  timezone: string;
}
export function parseBranch(value: unknown): Branch {
  const v = record(value);
  return {
    id: text(v.id),
    tenantId: text(v.tenantId),
    name: text(v.name),
    status: text(v.status),
    timezone: text(v.timezone),
  };
}
export interface ApiDepartment {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  type: string;
  status: string;
}
export function parseDepartment(value: unknown): ApiDepartment {
  const v = record(value);
  return {
    id: text(v.id),
    tenantId: text(v.tenantId),
    branchId: text(v.branchId),
    name: text(v.name),
    type: text(v.type),
    status: text(v.status),
  };
}
export interface CatalogItem {
  id: string;
  tenantId: string;
  itemType: string;
  name: string;
  sku: string | null;
  uom: string;
  status: string;
  currency: string | null;
  sellingPrice: string | null;
}
export function parseItem(value: unknown): CatalogItem {
  const v = record(value);
  const sellingPrice = optionalText(v.sellingPrice);
  if (sellingPrice !== null && !/^\d+(\.\d{1,4})?$/.test(sellingPrice)) throw invalid();
  return {
    id: text(v.id),
    tenantId: text(v.tenantId),
    itemType: text(v.itemType),
    name: text(v.name),
    sku: optionalText(v.sku),
    uom: text(v.uom),
    status: text(v.status),
    currency: optionalText(v.currency),
    sellingPrice,
  };
}
export interface ApiSupplier {
  id: string;
  tenantId: string;
  name: string;
  externalReference: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: string;
}
export function parseSupplier(value: unknown): ApiSupplier {
  const v = record(value);
  return {
    id: text(v.id),
    tenantId: text(v.tenantId),
    name: text(v.name),
    externalReference: optionalText(v.externalReference),
    contactName: optionalText(v.contactName),
    contactPhone: optionalText(v.contactPhone),
    contactEmail: optionalText(v.contactEmail),
    status: text(v.status),
  };
}
export interface ApiCustomer {
  id: string;
  tenantId: string;
  displayName: string;
  externalReference: string | null;
  phone: string | null;
  email: string | null;
  creditCeiling: string | null;
  currency: string | null;
  status: string;
}
export function parseCustomer(value: unknown): ApiCustomer {
  const v = record(value);
  const creditCeiling = optionalText(v.creditCeiling);
  if (creditCeiling !== null && !/^\d+(\.\d{1,4})?$/.test(creditCeiling)) throw invalid();
  return {
    id: text(v.id),
    tenantId: text(v.tenantId),
    displayName: text(v.displayName),
    externalReference: optionalText(v.externalReference),
    phone: optionalText(v.phone),
    email: optionalText(v.email),
    creditCeiling,
    currency: optionalText(v.currency),
    status: text(v.status),
  };
}
