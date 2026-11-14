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
 * @param props Orders already scoped to this sample Reception workspace.
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
 * @param props Current local preview orders and route base.
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
 * @param props Current Reception sample orders, route base and whether to show only debtor accounts.
 * @returns Named customer accounts and source-linked credit entries; no invented credit approvals.
 */
export function ReceptionCustomers({
  orders,
  base,
  credits = false,
}: Props & { credits?: boolean }) {
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
        {((credits &&
          !orders.some((order) => order.payments.some((payment) => payment.method === 'DEBT'))) ||
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
                const debt = debtOrders
                  .flatMap((order) => order.payments)
                  .filter((payment) => payment.method === 'DEBT')
                  .reduce((sum, payment) => sum + payment.amount, 0);
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
            ? 'Credit approval and repayment posting require the agreed backend policy. No debt write-off or self-approval is offered here.'
            : 'Sample contacts only. Customer management APIs are not connected.'}
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
  if (page === 'profile')
    return (
      <>
        <ReceptionHeading
          title="My profile"
          description="Your Reception identity and assigned workspace."
        />
        <section className="sw-panel sw-detail">
          <div className="sw-profile-heading">
            <span className="sw-avatar">FA</span>
            <div>
              <h2>Fatima Ahmed</h2>
              <p className="sw-muted">Receptionist · Sample profile</p>
            </div>
          </div>
          <dl>
            {[
              ['Business', 'Tally Artisan Bakery'],
              ['Branch', 'Ikeja'],
              ['Department', 'Reception'],
              ['Role', 'Receptionist / Cashier'],
              ['Shift group', 'Group B'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="sw-callout">
            Your manager maintains your assignments. Reception cannot change its own role or
            department.
          </p>
        </section>
      </>
    );
  if (page === 'schedule')
    return (
      <>
        <ReceptionHeading
          title="My schedule"
          description="Your assigned Reception shifts · 02–08 November 2026 · Sample data."
        />
        <section className="sw-panel">
          <div className="sw-panel-heading">
            <h2>This week · All times WAT</h2>
            <span className="sw-label">Group B</span>
          </div>
          <div className="sw-table-scroll">
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {['Mon 02', 'Tue 03', 'Wed 04', 'Thu 05', 'Fri 06', 'Sat 07', 'Sun 08'].map(
                  (day, index) => (
                    <tr key={day}>
                      <td>{day} Nov</td>
                      <td>{index === 6 ? 'Rest day' : index < 3 ? 'Morning' : 'Evening'}</td>
                      <td>{index === 6 ? '—' : index < 3 ? '06:00–14:00' : '14:00–22:00'}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  return (
    <>
      <ReceptionHeading
        title="Activity history"
        description="Your sample orders and their current handoff state. No fabricated audit trail."
      />
      <section className="sw-panel sw-detail">
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
        <p className="sw-muted">This is a preview activity summary, not a server audit log.</p>
      </section>
    </>
  );
}
