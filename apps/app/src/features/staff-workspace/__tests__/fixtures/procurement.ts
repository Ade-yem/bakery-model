import { createReceipt, type Receipt } from '../../procurement/model';
export const suppliers = [
  { id: 'mill', name: 'Golden Grain Mills', contact: 'Toyin Adeyemi', phone: '+234 800 000 0101' },
  {
    id: 'ingredients',
    name: 'Prime Ingredients',
    contact: 'Emeka Obi',
    phone: '+234 800 000 0102',
  },
];
export const materials = [
  { id: 'flour', name: 'Wheat flour', unit: 'BAG (50kg)' },
  { id: 'sugar', name: 'Granulated sugar', unit: 'KILOGRAM' },
  { id: 'yeast', name: 'Instant yeast', unit: 'KILOGRAM' },
];

export const sampleReceipts: Receipt[] = [
  createReceipt(
    {
      id: 'REC-0101',
      supplierId: 'mill',
      materialId: 'flour',
      quantity: '10',
      unitCost: '18500',
      reference: 'GG-INV-904',
      receivedOn: '2026-11-04',
      note: 'Bags checked at the receiving bay.',
    },
    [],
    { suppliers, materials },
    '2026-11-04T07:20:00.000Z'
  ),
];
