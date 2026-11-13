/**
 * @file Step-by-step workflows for TallyBakery setup and daily operations.
 */

export interface WorkflowStep {
  step: number;
  title: string;
  summary: string;
  details: string;
  iconName: string;
  deliverable: string;
}

/**
 * 4 primary steps for Homepage Section 6 and How It Works page.
 */
export const HOMEPAGE_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: 'Create Your Business Workspace',
    summary: 'Register your enterprise in minutes with multi-branch, fiscal, and currency configurations.',
    details:
      'Set up your corporate profile, configure primary operating currencies, register branch locations, and establish standard tax, inventory, and accounting parameters.',
    iconName: 'Building2',
    deliverable: 'Verified Organization Workspace',
  },
  {
    step: 2,
    title: 'Configure Your Departments',
    summary: 'Mirror your company structure across procurement, inventory, production, and sales.',
    details:
      'Structure distinct operational departments such as Central Warehouse, Manufacturing & Assembly, Quality Control, Dispatch Logistics, and Retail Outlets.',
    iconName: 'LayoutGrid',
    deliverable: 'Custom Department Structure',
  },
  {
    step: 3,
    title: 'Add Staff & Assign Role Boundaries',
    summary: 'Invite team members with role-specific access permissions and operational duties.',
    details:
      'Issue access invitations to operators, supervisors, cashiers, and managers. Establish strict permission barriers so cashiers handle registers while production teams focus on operations.',
    iconName: 'UserCheck',
    deliverable: 'Role-Based Access Matrix',
  },
  {
    step: 4,
    title: 'Manage Daily Business Operations',
    summary: 'Track real-time inventory, process sales, monitor production, and balance shifts.',
    details:
      'Log received raw materials, track production runs, process customer orders across retail and wholesale channels, and verify shift handovers with reconciled financial ledgers.',
    iconName: 'CheckCircle2',
    deliverable: 'Live Reconciled Ledger',
  },
];

/**
 * Detailed 6-step end-to-end operational guide for How It Works page.
 */
export const DETAILED_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: 'Business Registration & Configuration',
    summary: 'Set up your operational enterprise, branch network, and fiscal policies.',
    details:
      'Specify multi-location facilities, base operational currency, standard tax rules, and company-wide shift policies in an intuitive onboarding interface.',
    iconName: 'Building2',
    deliverable: 'Organization Profile & Settings',
  },
  {
    step: 2,
    title: 'Department & Facility Setup',
    summary: 'Map every branch, facility, and internal work center.',
    details:
      'Build your organizational hierarchy across inventory warehouses, assembly lines, processing plants, logistics fulfillment centers, and point-of-sale store counters.',
    iconName: 'LayoutGrid',
    deliverable: 'Operational Facility Map',
  },
  {
    step: 3,
    title: 'Role-Based Access Delegation',
    summary: 'Define staff permissions and departmental access boundaries.',
    details:
      'Assign distinct roles (Owner, General Manager, Department Supervisor, Cashier, Operator) ensuring strict data segregation and information security.',
    iconName: 'UserCheck',
    deliverable: 'Role & Permission Controls',
  },
  {
    step: 4,
    title: 'Real-Time Inventory & Material Inflow',
    summary: 'Receive, catalog, and allocate raw materials and finished products.',
    details:
      'Track procurement purchase orders, record supplier deliveries, monitor minimum stock levels, and issue materials to operational units with tracked internal manifests.',
    iconName: 'PackageCheck',
    deliverable: 'Immutable Stock Journal',
  },
  {
    step: 5,
    title: 'Production, Sales & Order Fulfillment',
    summary: 'Execute production schedules and fulfill customer orders seamlessly.',
    details:
      'Coordinate team output against demand schedules, process retail cash register sales and wholesale client orders, track payments, and verify dispatch manifests.',
    iconName: 'ReceiptText',
    deliverable: 'Order & Production Ledger',
  },
  {
    step: 6,
    title: 'End-of-Shift Reconciliation & Auditing',
    summary: 'Lock cash registers and verify physical inventory counts before handover.',
    details:
      'Conduct digital shift handovers with verified cash counts, card terminal settlement comparisons, stock balance verification, and tamper-evident supervisor sign-offs.',
    iconName: 'Scale',
    deliverable: 'Signed Shift Reconciliation Seal',
  },
];
