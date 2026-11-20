/** @file Synthetic bakery procurement fixtures for the interactive client preview. */
import type { StaffAccess } from '../access';
import type { ProcurementSnapshot } from './types';

export const procurementAccess: StaffAccess = {
  enabledModules: ['procurement', 'inventory', 'suppliers'],
  permissions: [
    'procurement:view',
    'inventory:view',
    'suppliers:view',
    'records:view',
  ],
};

export const initialProcurementSnapshot: ProcurementSnapshot = {
  suppliers: [
    {
      id: 'SUP-001',
      name: 'Golden Penny Flour Mills',
      category: 'Flour & Grains',
      contactName: 'Tunde Bakare',
      phone: '+234 803 412 8890',
      email: 'orders@goldenpenny-sample.ng',
      leadTimeDays: 2,
    },
    {
      id: 'SUP-002',
      name: 'Lagos Dairy & Fats Co.',
      category: 'Dairy & Shortening',
      contactName: 'Ngozi Eze',
      phone: '+234 809 771 2045',
      email: 'dispatch@lagosdairy-sample.ng',
      leadTimeDays: 1,
    },
    {
      id: 'SUP-003',
      name: 'WestCoast Packaging Ltd.',
      category: 'Packaging & Wraps',
      contactName: 'Chidi Okafor',
      phone: '+234 805 330 9112',
      email: 'sales@westcoastpack-sample.ng',
      leadTimeDays: 3,
    },
  ],
  materials: [
    {
      id: 'RM-001',
      sku: 'ING-FLR-50',
      name: 'Bread Flour · 50kg bag',
      unit: '50kg bag',
      currentStock: 6,
      minThreshold: 12,
      lastUnitCostKobo: 5450000,
      preferredSupplierId: 'SUP-001',
    },
    {
      id: 'RM-002',
      sku: 'ING-BTR-25',
      name: 'Unsalted Butter · 25kg block',
      unit: '25kg block',
      currentStock: 0,
      minThreshold: 4,
      lastUnitCostKobo: 8200000,
      preferredSupplierId: 'SUP-002',
    },
    {
      id: 'RM-003',
      sku: 'ING-YST-10',
      name: 'Instant Yeast · 10kg carton',
      unit: '10kg carton',
      currentStock: 14,
      minThreshold: 5,
      lastUnitCostKobo: 3100000,
      preferredSupplierId: 'SUP-001',
    },
    {
      id: 'RM-004',
      sku: 'ING-SGR-50',
      name: 'Granulated Sugar · 50kg bag',
      unit: '50kg bag',
      currentStock: 10,
      minThreshold: 8,
      lastUnitCostKobo: 4800000,
      preferredSupplierId: 'SUP-001',
    },
    {
      id: 'RM-005',
      sku: 'PKG-LOAF-1K',
      name: 'Printed Loaf Polybags · 1,000 pack',
      unit: '1,000 pack',
      currentStock: 3,
      minThreshold: 5,
      lastUnitCostKobo: 1450000,
      preferredSupplierId: 'SUP-003',
    },
  ],
  purchaseOrders: [
    {
      id: 'PO-0102',
      poNumber: 'PO-0102',
      supplierId: 'SUP-002',
      status: 'OPEN',
      createdAt: '2026-11-20T07:15:00Z',
      expectedDate: '2026-11-21',
      lines: [
        {
          materialId: 'RM-002',
          materialName: 'Unsalted Butter · 25kg block',
          unit: '25kg block',
          quantity: 6,
          unitCostKobo: 8200000,
        },
      ],
      totalAmountKobo: 49200000,
      notes: 'Urgent morning pastry restock',
    },
    {
      id: 'PO-0101',
      poNumber: 'PO-0101',
      supplierId: 'SUP-001',
      status: 'RECEIVED',
      createdAt: '2026-11-19T14:30:00Z',
      expectedDate: '2026-11-20',
      lines: [
        {
          materialId: 'RM-003',
          materialName: 'Instant Yeast · 10kg carton',
          unit: '10kg carton',
          quantity: 5,
          unitCostKobo: 3100000,
        },
      ],
      totalAmountKobo: 15500000,
      notes: 'Weekly yeast replenishment',
    },
  ],
  receipts: [
    {
      id: 'REC-0201',
      receiptNumber: 'REC-0201',
      poId: 'PO-0101',
      supplierId: 'SUP-001',
      reference: 'GP-INV-4410',
      receivedAt: '2026-11-20T06:45:00Z',
      receivedBy: 'Kemi Adeyemi',
      lines: [
        {
          materialId: 'RM-003',
          materialName: 'Instant Yeast · 10kg carton',
          unit: '10kg carton',
          quantity: 5,
          unitCostKobo: 3100000,
        },
      ],
      totalAmountKobo: 15500000,
      notes: 'Delivered intact at Ikeja store gate',
    },
  ],
  movements: [
    {
      id: 'MOV-0301',
      materialId: 'RM-003',
      type: 'INBOUND_PROCUREMENT',
      quantityDelta: 5,
      receiptId: 'REC-0201',
      createdAt: '2026-11-20T06:45:00Z',
      actor: 'Kemi Adeyemi',
    },
  ],
};

