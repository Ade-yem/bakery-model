import { useDepartmentData } from '../../integration/workspace';
import { StaffPersonal } from '../StaffPersonal';
import { outstanding } from './repayments';
/** @file Reception lists, customers, credit and personal pages. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { money, statusLabels } from './data';
import { orderTotal, type ReceptionOrder } from './orders';
interface Props {
  orders: ReceptionOrder[];
  base: string;
}
/**
 * @description Presents Reception order totals and dispatch state without stock/fulfillment controls.
 * @param props Orders already scoped to this Reception workspace.
 * @returns Order table or a useful empty state.
 */
export function OrderTable({ orders, base }: Props) {
  return (
    <div className="sw-table-scroll">
      <table className="sw-table">
        <thead>
          <tr>
            <th>Order / customer</th>
            <th>Total</th>
            <th>Dispatch state</th>
            <th>Record</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <strong>{order.id}</strong>
                <span>{order.customer}</span>
              </td>
              <td className="rc-money">{money.format(orderTotal(order.lines) / 100)}</td>
              <td>
                <span className="sw-label">{statusLabels[order.status]}</span>
              </td>
              <td>
                <Link
                  className="sw-inline"
                  aria-label={`View order ${order.id}`}
                  to={`${base}/records/${order.id}`}
                >
                  <ArrowUpRight size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && (
        <div className="sw-empty">
          <h3>No matching orders</h3>
          <p>Try another order, customer or dispatch state.</p>
        </div>
      )}
    </div>
  );
}
/**
 * @description Keeps all Reception page headings consistent with the approved staff shell.
 * @param props Page title and context.
 * @returns A single main page heading.
 */
export function ReceptionHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="sw-page-header">
      <div>
        <p className="sw-eyebrow">Reception / My workspace</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}
/**
 * @description Filters Reception records without changing or concealing canonical order state.
 * @param props Current local orders and route base.
 * @returns Search, status filter and order list.
 */
export function ReceptionOrders({ orders, base }: Props) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const matches = orders.filter(
    (order) =>
      `${order.id} ${order.customer}`.toLowerCase().includes(query.toLowerCase()) &&
      (status === 'All' || order.status === status)
  );
  return (
    <>
      <ReceptionHeading
        title="Orders & payments"
        description="Track settlement and your explicit handoff to Disbursement."
      />
      <div className="rc-toolbar">
        <label className="sw-search">
          <Search size={16} />
          <span className="sw-sr-only">Search orders</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order or customer…"
          />
        </label>
        <label className="rc-filter">
          <span className="sw-sr-only">Dispatch state</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="All">All dispatch states</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Button to={`${base}/orders/new`} size="sm" icon={<ArrowUpRight size={15} />}>
          New order
        </Button>
      </div>
      <section className="sw-panel">
        <OrderTable orders={matches} base={base} />
      </section>
    </>
  );
}
/**
 * @description Shows paid/credit-approved orders awaiting manual push and unsettled orders requiring evidence.
 * @param props Reception orders and detail route base.
 * @returns Task list containing no production or fulfillment actions.
 */
export function ReceptionTasks({ orders, base }: Props) {
  const actionable = orders.filter((order) => order.status !== 'PUSHED');
  return (
    <>
      <ReceptionHeading
        title="Department tasks"
        description="Review settlement and hand orders over when they are ready."
      />
      <section className="sw-panel">
        {actionable.map((order) => (
          <article className="sw-task-detail" key={order.id}>
            <div>
              <span className="sw-eyebrow">{order.id}</span>
              <h2>{order.customer}</h2>
              <p>{statusLabels[order.status]}</p>
            </div>
            <Link className="sw-quiet" to={`${base}/records/${order.id}`}>
              Review order <ArrowUpRight size={15} />
            </Link>
          </article>
        ))}
        {!actionable.length && <div className="sw-empty">No orders need your action.</div>}
      </section>
    </>
  );
}
/**
 * @description Displays customer contacts or debt grouped from recorded Reception tender entries.
 * @param props Current Reception orders, route base and whether to show only debtor accounts.
 * @returns Named customer accounts and source-linked credit entries; no invented credit approvals.
 */
export function ReceptionCustomers({
  orders,
  base,
  credits = false,
}: Props & { credits?: boolean }) {
  const ledger = { entries: useDepartmentData('reception').repayments };
  const customers = [
    ...new Set(
      orders.filter((order) => order.customer !== 'Walk-in customer').map((order) => order.customer)
    ),
  ];
  return (
    <>
      <ReceptionHeading
        title={credits ? 'Customer credit' : 'Customers'}
        description={
          credits
            ? 'Unpaid allocations are receivables, not money received.'
            : 'Customer identity and contact evidence attached to your orders.'
        }
      />
      <section className="sw-panel">
        {((credits && orders.every((order) => outstanding(order, ledger.entries) === 0)) ||
          (!credits && !customers.length)) && (
          <div className="sw-empty">
            <h2>{credits ? 'No customer credit recorded' : 'No named customers yet'}</h2>
            <p>Customer records appear when an order includes customer details.</p>
          </div>
        )}
        <div className="sw-table-scroll">
          <table className="sw-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>{credits ? 'Recorded debt' : 'Orders'}</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((name) => {
                const source = orders.filter((order) => order.customer === name);
                const debtOrders = source.filter((order) =>
                  order.payments.some((p) => p.method === 'DEBT')
                );
                const debt =
                  debtOrders
                    .flatMap((order) => order.payments)
                    .filter((payment) => payment.method === 'DEBT')
                    .reduce((sum, payment) => sum + payment.amount, 0) -
                  ledger.entries
                    .filter((entry) => source.some((order) => order.id === entry.orderId))
                    .reduce((sum, entry) => sum + entry.amount, 0);
                if (credits && debt === 0) return null;
                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{source[0].contact || 'Not provided'}</td>
                    <td className={credits ? 'rc-money' : ''}>
                      {credits ? money.format(debt / 100) : source.length}
                    </td>
                    <td>
                      <Link
                        className="sw-quiet"
                        to={`${base}/records/${(credits ? debtOrders[0] : source[0]).id}`}
                      >
                        View source order
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="sw-panel-footer">
          {credits
            ? 'Credit approval and repayments require an authorized manager. Reception cannot approve its own credit.'
            : 'Customer details are read-only. Contact an authorized manager for changes.'}
        </div>
      </section>
    </>
  );
}
/**
 * @description Renders personal activity, schedule or profile using Reception identity only.
 * @param props Selected personal page and locally recorded orders.
 * @returns Read-only personal records without admin editing controls.
 */
export function ReceptionPersonal({ page, orders }: { page: string; orders: ReceptionOrder[] }) {
  if (page === 'profile' || page === 'schedule') return <StaffPersonal page={page} />;
  return (
    <>
      <ReceptionHeading
        title="Activity history"
        description="Your orders and their current handoff state."
      />
      <section className="sw-panel sw-detail">
        {!orders.length && (
          <div className="sw-empty">
            <h2>No order activity yet</h2>
            <p>Recorded orders will appear here.</p>
          </div>
        )}
        <ol className="sw-timeline">
          {orders.map((order) => (
            <li key={order.id}>
              <time>
                {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Africa/Lagos',
                })}
              </time>
              <div>
                <h3>Captured {order.id}</h3>
                <p>
                  {order.customer} · {statusLabels[order.status]}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="sw-muted">
          Order activity is shown here. Finalized audit history is read-only.
        </p>
      </section>
    </>
  );
}
