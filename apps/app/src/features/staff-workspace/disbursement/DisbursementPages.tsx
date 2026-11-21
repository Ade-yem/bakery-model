import { useStaffIdentity } from '../useStaffIdentity';
import { useDepartmentData } from '../../integration/workspace';
import { ShiftBadge } from '../ShiftBadge';
import { Link } from 'react-router-dom';
import { ArrowRight, PackageCheck, Boxes, ClipboardCheck } from 'lucide-react';
import { StaffHeading } from '../StaffPages';
import { balances, type State } from './model';

export function DisbursementHome({ state, base }: { state: State; base: string }) {
  const identity = useStaffIdentity();
  const data = useDepartmentData('disbursement');
  const products = data.products;
  const stock = balances(state, data.opening);
  const incoming = data.transfers.filter(
    (item) => !state.events.some((e) => e.kind === 'accept' && e.id === item.id)
  );
  const waiting = data.orders.filter(
    (item) => !state.events.some((e) => e.kind === 'fulfill' && e.id === item.id)
  );
  return (
    <>
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">{identity.date}</p>
          <h1>Welcome, {identity.name}.</h1>
          <p>Count it in. Check it out. Keep every handoff clear.</p>
        </div>
        <Link className="sw-primary" to={`${base}/tasks`}>
          Review department tasks <ArrowRight size={16} />
        </Link>
      </header>
      <section className="sw-shift-banner" aria-label="Current shift">
        <ShiftBadge department="disbursement" />
        <strong>{identity.shiftLabel}</strong>
        <span>Disbursement / {identity.branch}</span>
        <Link to={`${base}/schedule`}>
          My schedule <ArrowRight size={14} />
        </Link>
      </section>
      <section className="sw-stats" aria-label="Disbursement summary">
        {[
          {
            label: 'Incoming transfers',
            value: incoming.length,
            note: 'Awaiting independent count',
            Icon: Boxes,
          },
          {
            label: 'Orders to fulfill',
            value: waiting.length,
            note: 'Explicitly pushed by Reception',
            Icon: PackageCheck,
          },
          {
            label: 'Accepted stock',
            value: Object.values(stock).reduce((sum, value) => sum + value, 0),
            note: 'Whole units · all listed products',
            Icon: ClipboardCheck,
          },
        ].map(({ label, value, note, Icon }) => (
          <div key={label}>
            <div className="sw-stat-title">
              {label}
              <Icon size={16} />
            </div>
            <strong className="sw-stat-value">{value}</strong>
            <p>{note}</p>
          </div>
        ))}
      </section>
      <div className="sw-home-grid">
        <section className="sw-panel">
          <div className="sw-panel-heading">
            <div>
              <p className="sw-eyebrow">Up next</p>
              <h2>Your next handoffs</h2>
            </div>
            <Link to={`${base}/tasks`}>
              All tasks <ArrowRight size={14} />
            </Link>
          </div>
          {[...incoming, ...waiting].slice(0, 4).map((item, i) => (
            <article className="sw-task-row" key={item.id}>
              <span className="sw-task-number">0{i + 1}</span>
              <div>
                <span className="sw-mini">{item.id}</span>
                <h3>{products[item.product]}</h3>
                <p>
                  {'submitted' in item
                    ? `${item.submitted} submitted · count before acceptance`
                    : `${item.quantity} units · ready to pack`}
                </p>
              </div>
              <Link className="sw-quiet" to={`${base}/records/${item.id}`}>
                Review <ArrowRight size={14} />
              </Link>
            </article>
          ))}
          {!incoming.length && !waiting.length && (
            <div className="sw-empty">
              <h3>All handoffs reviewed</h3>
              <p>Your completed actions are in activity history.</p>
            </div>
          )}
        </section>
        <aside className="sw-panel sw-note">
          <div className="sw-note-icon">
            <PackageCheck size={24} />
          </div>
          <p className="sw-eyebrow">Independent receiving</p>
          <h2>Available means accepted.</h2>
          <p>
            Production submissions remain pending until you count and accept the physical units.
            Explain any difference; the original submitted count remains on the record.
          </p>
          <Link to={`${base}/stock`}>
            Review stock & closing counts <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
    </>
  );
}

export function DisbursementHistory({ state, base }: { state: State; base: string }) {
  const data = useDepartmentData('disbursement');
  const products = data.products;
  return (
    <>
      <StaffHeading
        title="Activity history"
        description="Your recorded activity. Completed entries remain in the history."
      />
      <section className="sw-panel">
        {!state.events.length ? (
          <div className="sw-empty">
            <h2>No stock activity yet</h2>
            <p>
              Accept a transfer, fulfill an order or record a physical count to start your history.
            </p>
            <Link to={`${base}/tasks`}>Review tasks</Link>
          </div>
        ) : (
          [...state.events].reverse().map((event, index) => (
            <article className="sw-task-row" key={`${event.at}-${index}`}>
              <div>
                <span className="sw-mini">
                  {new Date(event.at).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} WAT ·
                  Saved on device
                </span>
                <h2>
                  {event.kind === 'accept'
                    ? 'Transfer accepted'
                    : event.kind === 'fulfill'
                      ? 'Order fulfilled'
                      : 'Physical count recorded'}{' '}
                  · {event.id}
                </h2>
                <p>
                  {products[event.product]} · {event.quantity} units
                  {event.kind !== 'fulfill'
                    ? ` · difference ${event.quantity - event.expected}`
                    : ''}
                </p>
                {event.note && <p>{event.note}</p>}
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}
