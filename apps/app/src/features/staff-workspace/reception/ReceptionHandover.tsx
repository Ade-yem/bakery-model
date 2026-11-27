import { useDepartmentData } from '../../integration/workspace';
import { useAuth } from '../../integration/auth';
import { ReceptionHeading } from './ReceptionPages';
import { HandoverPage } from '../handover/HandoverPage';
import { cashSummary } from './handover';
import type { ReceptionOrder } from './orders';
export function ReceptionHandover({ orders }: { orders: ReceptionOrder[] }) {
  const data = useDepartmentData('reception');
  const { session } = useAuth();
  if (data.openingCash === null || data.approvedExpenses === null)
    return (
      <ReceptionHeading
        title="Cash reconciliation unavailable"
        description="Verified opening cash and approved expenses are required before handover."
      />
    );
  const received = data.repayments
    .filter((entry) => entry.method === 'CASH')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const summary = cashSummary(orders, data.openingCash, data.approvedExpenses, received);
  return (
    <HandoverPage
      department="reception"
      actor={session!.userId}
      lines={[{ id: 'cash', label: 'Cash drawer', expected: summary.expected, scale: 100 }]}
    />
  );
}
