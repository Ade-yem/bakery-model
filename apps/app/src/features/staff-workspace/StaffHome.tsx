import { useStaffIdentity } from './useStaffIdentity';
import { ShiftBadge } from './ShiftBadge';
import { Allowed } from './Allowed';
import { useProductionRecords } from './production-store';
import { Button } from '../../components/shared/Button';
/** @file Production staff home, with assigned work above routine history. */
import { ArrowRight, ArrowUpRight, Clock3, ClipboardList, PackageCheck, Wheat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDepartmentData } from '../integration/workspace';
import { StaffTable } from './StaffTable';
interface Props {
  base: string;
  onBatch: () => void;
}
/**
 * @description Prioritizes production staff's current shift, pending work and own batch history.
 * @param props Workspace route base and batch draft action.
 * @returns Production home without cross-department private data.
 */
export function StaffHome({ base, onBatch }: Props) {
  const identity = useStaffIdentity();
  const records = useProductionRecords();
  const productionTasks = useDepartmentData('production').tasks;
  return (
    <>
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">{identity.date}</p>
          <h1>Welcome, {identity.name}.</h1>
          <p>Here’s what’s on your production floor today.</p>
        </div>
        <Allowed action="production:create">
          <Button className="sw-primary" onClick={onBatch}>
            Record a batch <ArrowUpRight size={16} />
          </Button>
        </Allowed>
      </header>
      <section className="sw-shift-banner" aria-label="Current shift">
        <ShiftBadge department="production" />
        <strong>{identity.shiftLabel}</strong>
        <span>Production / {identity.branch}</span>
        <Link to={`${base}/schedule`}>
          View my schedule <ArrowRight size={14} />
        </Link>
      </section>
      <section className="sw-stats" aria-label="My shift summary">
        {[
          {
            label: 'Batches recorded',
            value: String(records.length),
            note: 'In your current shift',
            Icon: ClipboardList,
          },
          {
            label: 'Units submitted',
            value: String(records.reduce((sum, r) => sum + r.quantity, 0)),
            note: 'Across recorded products',
            Icon: Wheat,
          },
          {
            label: 'Awaiting acceptance',
            value: String(
              records
                .filter((r) => r.state === 'Pending acceptance')
                .reduce((sum, r) => sum + r.quantity, 0)
            ),
            note: 'Physical receiving still required',
            Icon: PackageCheck,
          },
          {
            label: 'Scheduled shift',
            value: identity.shift?.label ?? 'Unassigned',
            note: identity.shiftLabel,
            Icon: Clock3,
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
              <h2>Your work for this shift</h2>
            </div>
            <Link to={`${base}/tasks`}>
              All tasks <ArrowRight size={14} />
            </Link>
          </div>
          {!productionTasks.length && (
            <div className="sw-empty">
              <h3>No assigned tasks</h3>
              <p>Assigned work will appear here.</p>
            </div>
          )}
          {productionTasks.map((task, i) => (
            <article className="sw-task-row" key={task.id}>
              <span className="sw-task-number">0{i + 1}</span>
              <div>
                <span className="sw-mini">{task.id}</span>
                <h3>{task.title}</h3>
                <p>{task.detail}</p>
              </div>
              {task.kind === 'batch' ? (
                <button className="sw-quiet" onClick={onBatch}>
                  {task.action}
                  <ArrowUpRight size={14} />
                </button>
              ) : (
                <Link className="sw-quiet" to={`${base}/records/${task.batchId}`}>
                  {task.action}
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </article>
          ))}
        </section>
        <aside className="sw-panel sw-note">
          <div className="sw-note-icon">
            <PackageCheck size={24} strokeWidth={1.5} />
          </div>
          <p className="sw-eyebrow">Production → Disbursement</p>
          <h2>Submitted isn’t received.</h2>
          <p>
            Your batch stays pending until Disbursement verifies the physical count. Only accepted
            units become available stock.
          </p>
          <Link to={`${base}/records`}>
            Review batch records <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
      <section className="sw-panel">
        <div className="sw-panel-heading">
          <div>
            <h2>Your latest batches</h2>
            <p>A traceable record of what you’ve submitted.</p>
          </div>
          <Link to={`${base}/records`}>
            All records <ArrowRight size={14} />
          </Link>
        </div>
        <StaffTable base={base} />
        <div className="sw-panel-footer">
          Production records · Receiving counts are recorded independently.
        </div>
      </section>
    </>
  );
}
