import { ShiftBadge } from '../ShiftBadge';
import { Allowed } from '../Allowed';
import { Link } from 'react-router-dom';
import { ArrowRight, PackagePlus, Files, Truck } from 'lucide-react';
import { StaffHeading } from '../StaffPages';
import { suppliers, materials, type Receipt } from './model';
export function ProcurementHome({
  receipts,
  base,
  tasks = false,
}: {
  receipts: Receipt[];
  base: string;
  tasks?: boolean;
}) {
  return (
    <>
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">Ikeja branch · Receiving shift</p>
          <h1>{tasks ? 'Department tasks' : 'Good morning, Bisi.'}</h1>
          <p>Record every delivery with a clear receiving trail.</p>
        </div>
        <Allowed action="procurement:create">
          <Link className="sw-primary" to={`${base}/receipts/new`}>
            Record material receipt <ArrowRight size={16} />
          </Link>
        </Allowed>
      </header>
      <section className="sw-shift-banner">
        <ShiftBadge department="procurement" />
        <strong>Morning · 06:00–14:00</strong>
        <span>Procurement</span>
        <Link to={`${base}/schedule`}>
          My schedule <ArrowRight size={14} />
        </Link>
      </section>
      {!tasks && (
        <section className="sw-stats" aria-label="Procurement summary">
          {[
            {
              label: 'Receipts recorded',
              value: receipts.length,
              note: 'In the current record set',
              Icon: Files,
            },
            {
              label: 'Listed suppliers',
              value: suppliers.length,
              note: 'Supplier directory',
              Icon: Truck,
            },
            {
              label: 'Material types',
              value: materials.length,
              note: 'Explicit units on each receipt',
              Icon: PackagePlus,
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
      )}
      <div className="sw-home-grid">
        <section className="sw-panel">
          <div className="sw-panel-heading">
            <div>
              <p className="sw-eyebrow">Receiving desk</p>
              <h2>Keep deliveries accountable</h2>
            </div>
          </div>
          {[
            {
              title: 'Check and record a delivery',
              note: 'Supplier, material, received quantity, cost and invoice evidence.',
              path: '/receipts/new',
              action: 'Record receipt',
            },
            {
              title: 'Review received-material evidence',
              note: 'Search supplier invoices and check read-only receipt details.',
              path: '/records',
              action: 'View receipts',
            },
            {
              title: 'Check the supplier contact',
              note: 'Check supplier contacts before resolving a delivery question.',
              path: '/suppliers',
              action: 'View suppliers',
            },
          ].map((item, index) => (
            <article className="sw-task-row" key={item.path}>
              <span className="sw-task-number">0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.note}</p>
              </div>
              <Link className="sw-quiet" to={`${base}${item.path}`}>
                {item.action}
                <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </section>
        <aside className="sw-panel sw-note">
          <div className="sw-note-icon">
            <PackagePlus size={24} />
          </div>
          <p className="sw-eyebrow">Receiving standard</p>
          <h2>Evidence before balances.</h2>
          <p>
            Keep an invoice or delivery reference with every receipt. Check the material and
            physical quantity against the delivery before recording it.
          </p>
          <Link to={`${base}/history`}>
            Review activity <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
    </>
  );
}
export function ProcurementSuppliers() {
  return (
    <>
      <StaffHeading title="Supplier directory" description="Supplier contacts · Read-only" />
      <section className="sw-panel">
        <div className="sw-table-scroll">
          <table className="sw-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong>
                    <span>Supplier</span>
                  </td>
                  <td>{s.contact}</td>
                  <td>{s.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sw-panel-footer">
          Supplier creation and changes require an agreed management permission and API.
        </div>
      </section>
    </>
  );
}
export function ProcurementHistory({ receipts, base }: { receipts: Receipt[]; base: string }) {
  return (
    <>
      <StaffHeading
        title="Activity history"
        description="Your receiving activity and receipt history"
      />
      <section className="sw-panel">
        {!receipts.length && (
          <div className="sw-empty">
            <h2>No receiving activity yet</h2>
            <Link to={`${base}/receipts/new`}>Record a receipt</Link>
          </div>
        )}
        {[...receipts]
          .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
          .map((r) => (
            <article className="sw-task-row" key={r.id}>
              <div>
                <span className="sw-mini">
                  {new Date(r.recordedAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} WAT
                </span>
                <h2>Material receipt recorded</h2>
                <p>
                  {r.quantity} {materials.find((m) => m.id === r.materialId)?.unit} ·{' '}
                  {materials.find((m) => m.id === r.materialId)?.name} · {r.reference}
                </p>
              </div>
              <Link className="sw-quiet" to={`${base}/records/${r.id}`}>
                View receipt <ArrowRight size={14} />
              </Link>
            </article>
          ))}
      </section>
    </>
  );
}
