/**
 * @file Comprehensive mock dataset of platform-level audit logs and administrative events.
 */

import type { PlatformAuditRecord } from './types';

/**
 * Realistic audit records representing platform administrator operations.
 */
export const MOCK_AUDIT_RECORDS: PlatformAuditRecord[] = [
  {
    id: 'AUD-901',
    adminId: 'admin-super-01',
    adminName: 'Amara Okafor',
    adminEmail: 'amara@cadenceops.com',
    action: 'Platform Settings Updated',
    actionType: 'settings_updated',
    module: 'Platform Settings',
    description: 'Updated session timeout duration and security password requirements.',
    timestamp: '2026-02-18T14:22:10Z',
    ipAddress: '197.210.65.12',
    status: 'success',
    relatedEntity: {
      type: 'settings',
      id: 'platform-global-settings',
      name: 'Global Platform Settings',
    },
    diff: [
      { field: 'sessionTimeoutMinutes', previousValue: '30', newValue: '60' },
      { field: 'requireMfaForAdmins', previousValue: 'false', newValue: 'true' },
    ],
  },
  {
    id: 'AUD-902',
    adminId: 'admin-super-01',
    adminName: 'Amara Okafor',
    adminEmail: 'amara@cadenceops.com',
    action: 'Subscription Extended',
    actionType: 'subscription_extended',
    module: 'Subscriptions',
    description: 'Extended subscription validity by 30 days following wire reconciliation.',
    timestamp: '2026-02-18T11:45:00Z',
    ipAddress: '197.210.65.12',
    status: 'success',
    relatedEntity: {
      type: 'subscription',
      id: 'SUB-8021',
      name: 'Golden Crust Bakery (Growth Monthly)',
    },
    diff: [
      { field: 'expiryDate', previousValue: '2026-02-15T23:59:59Z', newValue: '2026-03-17T23:59:59Z' },
      { field: 'status', previousValue: 'expired', newValue: 'active' },
    ],
  },
  {
    id: 'AUD-903',
    adminId: 'admin-sec-02',
    adminName: 'Femi Daniels',
    adminEmail: 'femi@cadenceops.com',
    action: 'Security MFA Enforced',
    actionType: 'security_event',
    module: 'Security / Auth',
    description: 'Enforced hardware security key challenge on platform administrative session.',
    timestamp: '2026-02-18T09:12:44Z',
    ipAddress: '102.89.44.19',
    status: 'success',
    relatedEntity: {
      type: 'settings',
      id: 'auth-mfa-policy',
      name: 'Super Admin Access Gateway',
    },
  },
  {
    id: 'AUD-904',
    adminId: 'admin-super-01',
    adminName: 'Amara Okafor',
    adminEmail: 'amara@cadenceops.com',
    action: 'Business Account Activated',
    actionType: 'business_activated',
    module: 'Businesses',
    description: 'Activated tenant account after business incorporation verification.',
    timestamp: '2026-02-17T16:05:30Z',
    ipAddress: '197.210.65.12',
    status: 'success',
    relatedEntity: {
      type: 'business',
      id: 'biz-golden-crust',
      name: 'Golden Crust Bakery Ltd',
    },
    diff: [
      { field: 'accountStatus', previousValue: 'pending', newValue: 'active' },
    ],
  },
  {
    id: 'AUD-905',
    adminId: 'admin-ops-03',
    adminName: 'Tariq Hassan',
    adminEmail: 'tariq@cadenceops.com',
    action: 'Subscription Plan Created',
    actionType: 'plan_created',
    module: 'Subscription Plans',
    description: 'Created new commercial billing tier "Enterprise Monthly".',
    timestamp: '2026-02-17T13:30:15Z',
    ipAddress: '197.210.70.88',
    status: 'success',
    relatedEntity: {
      type: 'plan',
      id: 'plan-enterprise-m',
      name: 'Enterprise Monthly',
    },
    diff: [
      { field: 'price', previousValue: 'N/A', newValue: '₦250,000' },
      { field: 'billingPeriod', previousValue: 'N/A', newValue: 'monthly' },
    ],
  },
  {
    id: 'AUD-906',
    adminId: 'admin-super-01',
    adminName: 'Amara Okafor',
    adminEmail: 'amara@cadenceops.com',
    action: 'Business Account Suspended',
    actionType: 'business_suspended',
    module: 'Businesses',
    description: 'Suspended business account due to overdue billing and unresolved audit flag.',
    timestamp: '2026-02-16T18:10:00Z',
    ipAddress: '197.210.65.12',
    status: 'warning',
    relatedEntity: {
      type: 'business',
      id: 'biz-lagos-dough',
      name: 'Lagos Dough Artisans',
    },
    diff: [
      { field: 'accountStatus', previousValue: 'active', newValue: 'suspended' },
    ],
  },
  {
    id: 'AUD-907',
    adminId: 'admin-sec-02',
    adminName: 'Femi Daniels',
    adminEmail: 'femi@cadenceops.com',
    action: 'Unusual IP Login Blocked',
    actionType: 'security_event',
    module: 'Security / Auth',
    description: 'Blocked unauthorized administrative login attempt from flagged ASN.',
    timestamp: '2026-02-16T04:22:11Z',
    ipAddress: '45.134.22.90',
    status: 'failure',
  },
  {
    id: 'AUD-908',
    adminId: 'admin-ops-03',
    adminName: 'Tariq Hassan',
    adminEmail: 'tariq@cadenceops.com',
    action: 'Subscription Cancelled',
    actionType: 'subscription_cancelled',
    module: 'Subscriptions',
    description: 'Cancelled subscription on client request following business restructuring.',
    timestamp: '2026-02-15T10:40:00Z',
    ipAddress: '197.210.70.88',
    status: 'warning',
    relatedEntity: {
      type: 'subscription',
      id: 'SUB-8025',
      name: 'Flour & Butter Co.',
    },
    diff: [
      { field: 'status', previousValue: 'active', newValue: 'cancelled' },
    ],
  },
  {
    id: 'AUD-909',
    adminId: 'admin-super-01',
    adminName: 'Amara Okafor',
    adminEmail: 'amara@cadenceops.com',
    action: 'Subscription Plan Archived',
    actionType: 'plan_archived',
    module: 'Subscription Plans',
    description: 'Archived legacy billing tier "Legacy Basic (2025)".',
    timestamp: '2026-02-14T15:20:00Z',
    ipAddress: '197.210.65.12',
    status: 'success',
    relatedEntity: {
      type: 'plan',
      id: 'plan-legacy-basic',
      name: 'Legacy Basic (2025)',
    },
    diff: [
      { field: 'status', previousValue: 'active', newValue: 'archived' },
    ],
  },
  {
    id: 'AUD-910',
    adminId: 'admin-ops-03',
    adminName: 'Tariq Hassan',
    adminEmail: 'tariq@cadenceops.com',
    action: 'Client Admin Status Changed',
    actionType: 'client_admin_status_changed',
    module: 'Client Admins',
    description: 'Temporarily locked primary administrator credentials pending email verification.',
    timestamp: '2026-02-13T12:00:00Z',
    ipAddress: '197.210.70.88',
    status: 'warning',
    relatedEntity: {
      type: 'client_admin',
      id: 'admin-usr-88',
      name: 'Babatunde Craig',
    },
    diff: [
      { field: 'status', previousValue: 'active', newValue: 'suspended' },
    ],
  },
  {
    id: 'AUD-911',
    adminId: 'admin-super-01',
    adminName: 'Amara Okafor',
    adminEmail: 'amara@cadenceops.com',
    action: 'Subscription Plan Changed',
    actionType: 'subscription_plan_changed',
    module: 'Subscriptions',
    description: 'Upgraded client subscription from Starter Monthly to Growth Monthly.',
    timestamp: '2026-02-12T09:15:00Z',
    ipAddress: '197.210.65.12',
    status: 'success',
    relatedEntity: {
      type: 'subscription',
      id: 'SUB-8024',
      name: 'Sweet Oven Pastries',
    },
    diff: [
      { field: 'planName', previousValue: 'Starter Monthly', newValue: 'Growth Monthly' },
      { field: 'price', previousValue: '₦25,000', newValue: '₦65,000' },
    ],
  },
  {
    id: 'AUD-912',
    adminId: 'admin-ops-03',
    adminName: 'Tariq Hassan',
    adminEmail: 'tariq@cadenceops.com',
    action: 'Subscription Plan Updated',
    actionType: 'plan_updated',
    module: 'Subscription Plans',
    description: 'Updated storage limit on Growth tier from 15 GB to 20 GB.',
    timestamp: '2026-02-10T11:00:00Z',
    ipAddress: '197.210.70.88',
    status: 'success',
    relatedEntity: {
      type: 'plan',
      id: 'plan-growth-m',
      name: 'Growth Monthly',
    },
    diff: [
      { field: 'storageAllowance', previousValue: '15 GB', newValue: '20 GB' },
    ],
  },
  {
    id: 'AUD-913',
    adminId: 'admin-sec-02',
    adminName: 'Femi Daniels',
    adminEmail: 'femi@cadenceops.com',
    action: 'Admin Session Expired',
    actionType: 'security_event',
    module: 'Security / Auth',
    description: 'Terminated inactive administrator session in accordance with idle timeout policy.',
    timestamp: '2026-02-09T22:15:00Z',
    ipAddress: '102.89.44.19',
    status: 'success',
  },
  {
    id: 'AUD-914',
    adminId: 'admin-super-01',
    adminName: 'Amara Okafor',
    adminEmail: 'amara@cadenceops.com',
    action: 'Support Contact Info Updated',
    actionType: 'settings_updated',
    module: 'Platform Settings',
    description: 'Updated official customer support email and emergency hotline.',
    timestamp: '2026-02-08T14:00:00Z',
    ipAddress: '197.210.65.12',
    status: 'success',
    relatedEntity: {
      type: 'settings',
      id: 'platform-global-settings',
      name: 'Global Platform Settings',
    },
    diff: [
      { field: 'supportPhone', previousValue: '+234 800 000 0000', newValue: '+234 800 223 3623' },
    ],
  },
];

/**
 * Appends a new audit record to the persistent in-memory audit store.
 * @param {Omit<PlatformAuditRecord, 'id' | 'timestamp'>} record - Audit payload.
 * @returns {PlatformAuditRecord} Created audit log item.
 */
export function recordPlatformAudit(
  record: Omit<PlatformAuditRecord, 'id' | 'timestamp'>
): PlatformAuditRecord {
  const newAudit: PlatformAuditRecord = {
    ...record,
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
  };
  MOCK_AUDIT_RECORDS.unshift(newAudit);
  return newAudit;
}
