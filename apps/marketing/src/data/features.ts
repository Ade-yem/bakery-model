/**
 * @file Feature module data for TallyBakery multi-industry business management platform.
 */

export interface FeatureModule {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  iconName: string;
  items: string[];
  operationalRole?: string;
}

/**
 * Four introductory feature cards for Homepage Section 3.
 */
export const INTRO_FEATURES = [
  {
    id: 'inventory-intro',
    title: 'Inventory & Stock Management',
    description:
      'Monitor raw materials, components, supplies, finished goods, and packaging with real-time stock balances and movement tracking across warehouses.',
    iconName: 'PackageCheck',
  },
  {
    id: 'production-intro',
    title: 'Production & Operations',
    description:
      'Organize daily production schedules, manage assembly and processing lines, track actual yields against bill-of-materials, and minimize wastage.',
    iconName: 'Flame',
  },
  {
    id: 'sales-intro',
    title: 'Sales & Order Management',
    description:
      'Handle point-of-sale transactions, wholesale pre-orders, custom invoices, deposit tracking, customer credit balances, and fulfillment receipts.',
    iconName: 'ReceiptText',
  },
  {
    id: 'staff-intro',
    title: 'Staff & Department Management',
    description:
      'Enforce departmental access boundaries, delegate granular staff role permissions, and maintain complete audit accountability across shifts.',
    iconName: 'Users',
  },
];

/**
 * Core functional modules for Homepage Section 4 and Features page.
 */
export const CORE_FEATURES: FeatureModule[] = [
  {
    id: 'inventory',
    title: 'Inventory Management',
    shortDescription: 'Precise material and stock control from procurement to fulfillment.',
    description:
      'Eliminate stockouts and inventory shrinkage with centralized tracking of raw materials and finished products, automatic reorder threshold alerts, and append-only inventory journals.',
    iconName: 'Boxes',
    items: [
      'Track materials, components, and goods by batch, SKU, and lot numbers',
      'Monitor available stock levels in real time across storerooms and locations',
      'Record stock movements: procurement intakes, internal transfers, and shrinkage',
      'Receive automated stock shortage and low-threshold reorder alerts',
      'Inspect tamper-evident, append-only inventory movement audit logs',
    ],
    operationalRole: 'Inventory Managers & Storekeepers',
  },
  {
    id: 'production',
    title: 'Production & Manufacturing',
    shortDescription: 'Structured operational schedules and production batch accountability.',
    description:
      'Coordinate operations teams, machinery, and workstations. Record batch inputs and outputs, track bill-of-materials consumption against yield, and manage workflow progression.',
    iconName: 'ChefHat',
    items: [
      'Schedule daily and weekly production and operational runs',
      'Record production batch quantities and finished goods output counts',
      'Track task assignments across processing, assembly, and packaging stations',
      'Monitor production progress, turnaround cycles, and scrap rates',
      'Coordinate handoffs between processing, quality inspection, and dispatch',
    ],
    operationalRole: 'Operations Leads & Production Supervisors',
  },
  {
    id: 'sales',
    title: 'Sales & Order Management',
    shortDescription: 'Counter POS, wholesale accounts, and clean transaction ledgers.',
    description:
      'Process front-counter retail transactions, wholesale client contracts, custom commercial orders, split deposits, and multi-channel fulfillment receipts.',
    iconName: 'CreditCard',
    items: [
      'Process walk-in retail sales and wholesale purchase orders',
      'Track order status from pending and processing through fulfillment and delivery',
      'Accept and record cash, credit card, and digital transfer payments',
      'Manage customer credit terms, deposit balances, and billing schedules',
      'Generate end-of-shift register settlement reports and sales journals',
    ],
    operationalRole: 'Sales Reps & Point-of-Sale Cashiers',
  },
  {
    id: 'staff',
    title: 'Staff Management',
    shortDescription: 'Role clarity, duty delegation, and organizational integrity.',
    description:
      'Define clear responsibility boundaries so operational crews, sales teams, and inventory controllers operate with targeted visibility and explicit accountability.',
    iconName: 'UserCheck',
    items: [
      'Add and manage employees with secure credential profiles',
      'Assign roles and responsibilities to prevent unauthorized data access',
      'Organize staff across shifts, physical branches, and work centers',
      'Configure granular access permissions for sensitive financial metrics',
      'Review staff activity trails, shift handovers, and attendance logs',
    ],
    operationalRole: 'Business Owners & HR Managers',
  },
  {
    id: 'departments',
    title: 'Department Management',
    shortDescription: 'Independent business units with unified cross-team coordination.',
    description:
      'Segment your business into processing, storage, dispatch, sales, and administrative units while synchronizing vital operational handovers and material transfers.',
    iconName: 'Layers',
    items: [
      'Create custom business departments (Procurement, Operations, Dispatch, Retail)',
      'Assign personnel to single or multiple operational departments',
      'Define departmental procedures and shift completion checklists',
      'Enforce departmental data isolation and access permissions',
      'Monitor departmental consumption records, output volume, and performance',
    ],
    operationalRole: 'General Managers & Department Heads',
  },
  {
    id: 'analytics',
    title: 'Analytics & Reporting',
    shortDescription: 'Operational data transformed into decisive business intelligence.',
    description:
      'Understand unit cost fluctuations, identify high-margin product lines, detect inventory discrepancies, and verify shift profit margins with automated reports.',
    iconName: 'BarChart3',
    items: [
      'Track daily, weekly, and monthly sales volume and revenue trends',
      'Monitor raw material consumption rates and stock shrinkage patterns',
      'Evaluate production yield efficiency and operational downtime metrics',
      'Analyze cash flow patterns, accounts receivable, and vendor disbursements',
      'Export audit-ready executive reports for management and accounting reviews',
    ],
    operationalRole: 'Executives & Financial Controllers',
  },
  {
    id: 'reconciliation',
    title: 'Shift & Financial Reconciliation',
    shortDescription: 'Tamper-evident drawer balances and inventory reconciliation.',
    description:
      'Close shifts with complete confidence. Match physical cash and payment processor settlements against logged sales, and verify stock balances against dispatch records.',
    iconName: 'Scale',
    items: [
      'Execute structured shift opening and closing verification workflows',
      'Reconcile cash drawer balances and terminal settlements against itemized sales',
      'Identify and flag discrepancy variances with automated status alerts',
      'Enforce digital signatures and immutable audit handover records',
      'Prevent silent record modifications with linked compensating ledger entries',
    ],
    operationalRole: 'Shift Supervisors & Compliance Auditors',
  },
];
