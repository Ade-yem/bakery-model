/**
 * @file Subscription plan definitions and feature matrices.
 * Positioned for businesses across retail, manufacturing, food production, hospitality, and commerce.
 */

import type { PricingPlan } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For independent businesses and single-facility operations needing reliable control.',
    monthlyPrice: 49,
    annualMonthlyPrice: 39,
    departmentLimit: 'Up to 2 departments',
    staffLimit: 'Up to 5 team members',
    ctaText: 'Get Started with Starter',
    features: [
      'Single facility operational workspace',
      'Up to 2 departments (e.g., Storeroom & Point-of-Sale)',
      'Up to 5 staff accounts with basic role permissions',
      'Raw material and inventory tracking with low-stock alerts',
      'Daily operational batch and activity logging',
      'Point-of-sale checkout and cash drawer management',
      'Shift opening and closing balance verification',
      'Standard weekly business performance reports',
      'Email customer support (24–48h response time)',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For expanding businesses managing multiple departments, wholesale accounts, and daily shifts.',
    monthlyPrice: 99,
    annualMonthlyPrice: 79,
    isPopular: true,
    departmentLimit: 'Up to 6 departments',
    staffLimit: 'Up to 20 team members',
    ctaText: 'Start Growth Plan',
    features: [
      'Multi-department workflows (Storage, Production, Logistics, Sales)',
      'Up to 6 dedicated work centers and inventory locations',
      'Up to 20 team members with granular permission matrices',
      'Wholesale order tracking and customer credit account ledgers',
      'Bill-of-materials yield tracking and material usage drawdowns',
      'Digital shift handover seals and variance alerts',
      'Inter-departmental stock transfer manifests and tracking',
      'Automated daily gross margin and shrinkage analytics',
      'Priority email and live chat support',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For multi-location enterprises, regional manufacturers, and high-volume commercial chains.',
    monthlyPrice: 199,
    annualMonthlyPrice: 159,
    departmentLimit: 'Unlimited departments',
    staffLimit: 'Unlimited team members',
    ctaText: 'Contact Enterprise Sales',
    features: [
      'Unlimited facilities, branches, and retail store locations',
      'Unlimited departments and specialized operational work centers',
      'Unlimited staff accounts with customizable role definitions',
      'Advanced multi-branch inventory transfers and unified purchasing',
      'Custom production batching schedules and automated BOM tracking',
      'Comprehensive audit trails with digital supervisor verification',
      'Customizable financial exports for ERP and accounting integration',
      'Multi-currency and multi-tax regional compliance support',
      'Dedicated account manager with 24/7 priority response SLA',
    ],
  },
];
