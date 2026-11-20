/**
 * @file Business Operations module router & host page for inventory, sales,
 * production, procurement, orders, payments, and credits.
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  BadgePercent,
  ShoppingCart,
  Truck,
  Flame,
  CreditCard,
  Wallet,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { OperationalModuleKey } from '../types';
import { SubscriptionGate } from '../components/SubscriptionGate';
import { PermissionGate } from '../components/PermissionGate';
import { MODULE_VIEW_PERMISSIONS, hasClientPermission } from '../permissions';
import { Button } from '../../../components/shared/Button';

interface ModuleSpec {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  records: Array<{ id: string; col1: string; col2: string; col3: string; col4: string; status: string }>;
  headers: [string, string, string, string, string];
}

const MODULE_SPECS: Record<OperationalModuleKey, ModuleSpec> = {
  inventory: {
    title: 'Central Stock & Material Inventory',
    subtitle: 'Track flour silos, ingredients, and bakery packaging materials',
    icon: Package,
    headers: ['Item & SKU', 'Location', 'Quantity on Hand', 'Unit Cost', 'Status'],
    records: [
      { id: 'INV-1', col1: 'Golden Penny Bakers Flour (50kg)', col2: 'Main Silo #1', col3: '240 Bags', col4: '₦48,500', status: 'Healthy' },
      { id: 'INV-2', col1: 'Granulated White Sugar (50kg)', col2: 'Raw Store', col3: '85 Bags', col4: '₦62,000', status: 'Healthy' },
      { id: 'INV-3', col1: 'Unsalted Butter Fat (20kg)', col2: 'Cold Room #2', col3: '14 Tubs', col4: '₦95,000', status: 'Reorder' },
      { id: 'INV-4', col1: 'Sourdough Culture Base (10L)', col2: 'Cold Room #1', col3: '22 Litres', col4: '₦32,000', status: 'Healthy' },
    ],
  },
  sales: {
    title: 'Point of Sale & Register Reconciliation',
    subtitle: 'Track daily counter cash, POS terminals, and walk-in sales',
    icon: BadgePercent,
    headers: ['Terminal / Register', 'Cashier', 'Tender Total', 'Variance', 'Status'],
    records: [
      { id: 'POS-1', col1: 'Lekki Main Register POS-01', col2: 'Chioma Okafor', col3: '₦412,500', col4: '₦0 (Balanced)', status: 'Sealed' },
      { id: 'POS-2', col1: 'Lekki Main Register POS-02', col2: 'Tunde Bakare', col3: '₦289,000', col4: '₦0 (Balanced)', status: 'Active' },
      { id: 'POS-3', col1: 'VI Outlet Express Counter', col2: 'Femi Alabi', col3: '₦640,000', col4: '+₦500', status: 'Sealed' },
    ],
  },
  orders: {
    title: 'Customer Orders & Wholesale Pipeline',
    subtitle: 'Manage bulk delivery schedules, retail orders, and fulfillment',
    icon: ShoppingCart,
    headers: ['Order Code', 'Customer / Client', 'Items & Quantity', 'Total Amount', 'Fulfillment'],
    records: [
      { id: 'ORD-8419', col1: 'Ebeano Supermarkets Lekki', col2: '600x Brioche Sandwich', col3: '₦540,000', col4: 'Dispatched', status: 'Dispatched' },
      { id: 'ORD-8420', col1: 'Hubmart Victoria Island', col2: '350x Artisanal Sourdough', col3: '₦420,000', col4: 'In Oven', status: 'Baking' },
      { id: 'ORD-8421', col1: 'Café Neo Lekki', col2: '120x Butter Croissants', col3: '₦180,000', col4: 'Packed', status: 'Ready' },
    ],
  },
  procurement: {
    title: 'Procurement & Purchase Requisitions',
    subtitle: 'Supplier invoices, delivery notes, and bulk vendor contracts',
    icon: Truck,
    headers: ['PO Number', 'Supplier', 'Items Ordered', 'Total Cost', 'Approval'],
    records: [
      { id: 'PO-2026-091', col1: 'Flour Mills of Nigeria Plc', col2: '200x Flour Bags 50kg', col3: '₦9,700,000', col4: 'Approved by GM', status: 'In Transit' },
      { id: 'PO-2026-092', col1: 'Dangote Sugar Refinery', col2: '50x Sugar Bags 50kg', col3: '₦3,100,000', col4: 'Pending GM Approval', status: 'Pending' },
    ],
  },
  production: {
    title: 'Baking Runs & Production Batches',
    subtitle: 'Daily dough yields, oven rotation schedules, and waste records',
    icon: Flame,
    headers: ['Batch Run #', 'Recipe Formula', 'Target Loaves', 'Actual Output', 'Efficiency'],
    records: [
      { id: 'BAT-481', col1: 'Standard Milk Bread 800g', col2: '1,000 Units', col3: '998 Units', col4: '99.8% Yield', status: 'Completed' },
      { id: 'BAT-482', col1: 'Golden Brioche Loaf 600g', col2: '450 Units', col3: '450 Units', col4: '100% Yield', status: 'Completed' },
      { id: 'BAT-483', col1: 'Country Sourdough Boule', col2: '300 Units', col3: 'In Proving Oven', col4: 'Est. 14:30', status: 'Baking' },
    ],
  },
  payments: {
    title: 'Disbursements & Payment Records',
    subtitle: 'Bank transfers, supplier payoffs, and shift disbursement audit',
    icon: CreditCard,
    headers: ['Payment Ref', 'Beneficiary', 'Payment Method', 'Amount', 'Verification'],
    records: [
      { id: 'PAY-901', col1: 'Flour Mills Logistics Direct', col2: 'NIBSS Bank Transfer', col3: '₦450,000', col4: 'Verified', status: 'Completed' },
      { id: 'PAY-902', col1: 'Lekki Diesel Supply Co.', col2: 'Bank Transfer', col3: '₦380,000', col4: 'Verified', status: 'Completed' },
    ],
  },
  credits: {
    title: 'Customer Credits & Debt Ledgers',
    subtitle: 'Outstanding wholesale receivables and client credit accounts',
    icon: Wallet,
    headers: ['Client Account', 'Credit Balance', 'Limit', 'Last Payment', 'Status'],
    records: [
      { id: 'CRD-1', col1: 'Ebeano Supermarket Group', col2: '₦320,000', col3: '₦1,000,000', col4: '₦500,000 (3 days ago)', status: 'Active Credit' },
      { id: 'CRD-2', col1: 'Mega Plaza Hotel Lagos', col2: '₦180,000', col3: '₦500,000', col4: '₦200,000 (1 week ago)', status: 'Active Credit' },
    ],
  },
};

export function BusinessOperationsPage(): React.ReactElement {
  const { moduleKey = 'inventory' } = useParams<{ moduleKey: OperationalModuleKey }>();
  const { subscription, actor } = useTenant();

  const validKey = (moduleKey as OperationalModuleKey) in MODULE_SPECS
    ? (moduleKey as OperationalModuleKey)
    : 'inventory';

  const spec = MODULE_SPECS[validKey];
  const requiredPermission = MODULE_VIEW_PERMISSIONS[validKey];

  // 1. Subscription Plan Gate Check
  if (!subscription.enabledModules.includes(validKey)) {
    return (
      <SubscriptionGate
        featureName={spec.title}
        requiredTier="Growth or Business"
        description={`The "${spec.title}" operational module is not available in your ${subscription.planName} tier. Upgrade your business workspace to unlock this operational capability.`}
      />
    );
  }

  // 2. Permission Gate Check
  if (!hasClientPermission(actor, requiredPermission)) {
    return <PermissionGate permission={requiredPermission} />;
  }

  const IconComp = spec.icon;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D9D3C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center shrink-0">
            <IconComp size={24} />
          </div>
          <div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-[#0B5C63]">
              Active Operation
            </span>
            <h1 className="text-2xl font-black text-[#10201F] tracking-tight">
              {spec.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#10201F]/70 mt-0.5">
              {spec.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/business/reports"
            className="text-xs font-bold text-[#0B5C63] hover:underline flex items-center gap-1"
          >
            Module Audit Reports <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Operational Table */}
      <div className="bg-white rounded-3xl border border-[#D9D3C0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D9D3C0]/60 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#10201F]">
            Operational Movement Ledger
          </h3>
          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
            Real-time Active Ledger
          </span>
        </div>

        <table className="w-full text-left text-xs text-[#10201F]">
          <thead className="bg-[#F6F3EA] border-b border-[#D9D3C0] text-3xs font-extrabold uppercase tracking-wider text-[#10201F]/70">
            <tr>
              <th className="py-3.5 px-5">{spec.headers[0]}</th>
              <th className="py-3.5 px-4">{spec.headers[1]}</th>
              <th className="py-3.5 px-4">{spec.headers[2]}</th>
              <th className="py-3.5 px-4">{spec.headers[3]}</th>
              <th className="py-3.5 px-5 text-right">{spec.headers[4]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C0]/40">
            {spec.records.map((r) => (
              <tr key={r.id} className="hover:bg-[#F6F3EA]/40 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="font-bold text-sm text-[#10201F] block">{r.col1}</span>
                  <code className="text-2xs font-mono text-[#10201F]/60">{r.id}</code>
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#10201F]/80">{r.col2}</td>
                <td className="py-3.5 px-4 font-bold text-[#10201F]">{r.col3}</td>
                <td className="py-3.5 px-4 text-[#10201F]/70">{r.col4}</td>
                <td className="py-3.5 px-5 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-2xs font-extrabold bg-[#0B5C63]/10 text-[#0B5C63]">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
