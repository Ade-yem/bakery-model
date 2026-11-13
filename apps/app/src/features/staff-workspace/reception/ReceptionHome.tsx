/** @file Shift-focused Reception overview, following the existing staff visual system. */
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Banknote, ClipboardList, Send, CreditCard } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { money } from './data';
import { OrderTable } from './ReceptionPages';
import type { ReceptionOrder } from './orders';
interface Props {
  orders: ReceptionOrder[];
  base: string;
}
/**
 * @description Prioritizes orders awaiting manual dispatch and keeps cash distinct from transfers and debt.
 * @param props Reception-only sample records and preview route base.
 * @returns Staff overview with source-linked order activity.
 */
export function ReceptionHome({ orders, base }: Props) {
  const cash = orders
    .flatMap((order) => order.payments)
    .filter((payment) => payment.method === 'CASH')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const debt = orders
    .flatMap((order) => order.payments)
    .filter((payment) => payment.method === 'DEBT')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pending = orders.filter((order) =>
    ['PAID_PENDING_DISPATCH', 'CREDIT_APPROVED_PENDING_DISPATCH'].includes(order.status)
  );
  return (
    <>
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">Wednesday, 04 November 2026 · Sample shift</p>
          <h1>Good morning, Fatima.</h1>
          <p>A clear record, from the counter to Disbursement.</p>
        </div>
        <Button to={`${base}/orders/new`} icon={<ArrowUpRight size={16} />}>
          New order
        </Button>
      </header>
      <section className="sw-shift-banner" aria-label="Current shift">
        <span className="sw-state sw-open">Open shift</span>
        <strong>Morning · 06:00–14:00</strong>
        <span>Reception / Ikeja branch</span>
        <Link to={`${base}/schedule`}>
          My schedule <ArrowRight size={14} />
        </Link>
      </section>
      <section className="sw-stats rc-stats" aria-label="Reception shift summary">
        {[
          {
            label: 'Orders recorded',
            value: String(orders.length),
            note: 'In this sample record set',
            Icon: ClipboardList,
          },
          {
            label: 'Awaiting manual push',
            value: String(pending.length),
            note: 'Settled or authorized credit',
            Icon: Send,
          },
          {
            label: 'Cash received',
            value: money.format(cash / 100),
            note: 'Excludes transfers and credit',
            Icon: Banknote,
          },
          {
            label: 'Customer credit',
            value: money.format(debt / 100),
            note: 'Receivables · not cash received',
            Icon: CreditCard,
          },
        ].map(({ label, value, note, Icon }) => (
          <div key={label}>
            <div className="sw-stat-title">
              {label}
              <Icon size={16} />
            </div>
            <strong
              className={`sw-stat-value ${label.includes('Cash') || label.includes('credit') ? 'rc-money rc-money-stat' : ''}`}
            >
              {value}
            </strong>
            <p>{note}</p>
          </div>
        ))}
      </section>
      <div className="sw-home-grid">
        <section className="sw-panel">
          <div className="sw-panel-heading">
            <div>
              <p className="sw-eyebrow">Up next</p>
              <h2>Ready for your handoff</h2>
            </div>
            <Link to={`${base}/tasks`}>
              All tasks <ArrowRight size={14} />
            </Link>
          </div>
          {pending.slice(0, 2).map((order, index) => (
            <article key={order.id} className="sw-task-row">
              <span className="sw-task-number">0{index + 1}</span>
              <div>
                <span className="sw-mini">{order.id}</span>
                <h3>{order.customer}</h3>
                <p>
                  {order.lines.reduce((sum, line) => sum + line.quantity, 0)} units · explicit push
                  required
                </p>
              </div>
              <Link className="sw-quiet" to={`${base}/records/${order.id}`}>
                Review order <ArrowUpRight size={14} />
              </Link>
            </article>
          ))}
          {!pending.length && (
            <div className="sw-empty">No orders are waiting for manual dispatch.</div>
          )}
        </section>
        <aside className="sw-panel sw-note">
          <div className="sw-note-icon">
            <Send size={24} strokeWidth={1.5} />
          </div>
          <p className="sw-eyebrow">Reception → Disbursement</p>
          <h2>Paid isn’t dispatched.</h2>
          <p>
            Review settlement, then explicitly push the order. Disbursement only sees orders after
            that handoff; Reception never marks them fulfilled.
          </p>
          <Link to={`${base}/records`}>
            Review your orders <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
      <section className="sw-panel">
        <div className="sw-panel-heading">
          <div>
            <h2>Your latest orders</h2>
            <p>Payment and dispatch stay separate on the record.</p>
          </div>
          <Link to={`${base}/records`}>
            All orders <ArrowRight size={14} />
          </Link>
        </div>
        <OrderTable orders={orders.slice(0, 5)} base={base} />
        <div className="sw-panel-footer">
          Sample data only · New entries and preview pushes stay on this browser.
        </div>
      </section>
    </>
  );
}
