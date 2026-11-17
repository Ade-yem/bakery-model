import { loadRepayments } from './repayments';
import { ReceptionHeading } from './ReceptionPages';
import { loadReceptionRecords } from './storage';
import { HandoverPage } from '../handover/HandoverPage';
import { cashSummary } from './handover';
import type { ReceptionOrder } from './orders';
export function ReceptionHandover({ orders }: { orders: ReceptionOrder[] }) {
  const ledger = loadRepayments(orders);
  if (ledger.error)
    return (
      <ReceptionHeading title="Repayment evidence needs attention" description={ledger.error} />
    );
  const received = ledger.entries
    .filter((e) => e.method === 'CASH')
    .reduce((sum, e) => sum + e.amount, 0);
  const summary = cashSummary(orders, 1000000, 150000, received);
  return (
    <HandoverPage
      department="reception"
      actor="reception@demo.tallybakery.test"
      currentLines={() => {
        const current = loadReceptionRecords();
        if (current.error) throw new Error(current.error);
        return [
          {
            id: 'cash',
            label: 'Cash drawer',
            expected: (() => {
              const repayments = loadRepayments(current.orders);
              if (repayments.error) throw new Error(repayments.error);
              return cashSummary(
                current.orders,
                1000000,
                150000,
                repayments.entries
                  .filter((e) => e.method === 'CASH')
                  .reduce((sum, e) => sum + e.amount, 0)
              ).expected;
            })(),
            scale: 100,
          },
        ];
      }}
      lines={[{ id: 'cash', label: 'Cash drawer', expected: summary.expected, scale: 100 }]}
    />
  );
}
