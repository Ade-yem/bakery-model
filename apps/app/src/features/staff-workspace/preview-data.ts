/** @file Synthetic production-only fixtures, isolated from authenticated workspace data. */
export const previewAccess = {
  enabledModules: ['production'],
  permissions: ['production:view', 'records:view', 'history:view', 'schedule:view'],
};
export const productionRecords = [
  {
    id: 'BAT-0186',
    product: 'Family loaf · 500g',
    quantity: 250,
    time: '09:35',
    state: 'Pending acceptance',
    sync: 'Acknowledged',
    flour: '5 bags',
    waste: 2,
  },
  {
    id: 'BAT-0185',
    product: 'Sandwich bread · 1kg',
    quantity: 100,
    time: '08:40',
    state: 'Accepted',
    sync: 'Acknowledged',
    flour: '4 bags',
    waste: 0,
  },
  {
    id: 'BAT-0184',
    product: 'Family loaf · 500g',
    quantity: 240,
    time: '07:25',
    state: 'Accepted with difference',
    sync: 'Acknowledged',
    flour: '5 bags',
    waste: 3,
  },
];
export const previewTasks = [
  {
    id: 'TASK-041',
    title: 'Record the next production batch',
    detail: 'Family loaf · 500g',
    note: 'Record actual output, materials consumed and waste.',
    action: 'Record batch',
    kind: 'batch',
  },
  {
    id: 'TASK-040',
    title: 'Review receiving difference',
    detail: 'BAT-0184 · 240 submitted / 238 accepted',
    note: 'The original submitted count remains on the record.',
    action: 'Review batch',
    kind: 'review',
  },
];
