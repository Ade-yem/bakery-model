import { Button } from '../../components/shared/Button';
/** @file Production staff home, with assigned work above routine history. */
import { ArrowRight, ArrowUpRight, Clock3, ClipboardList, PackageCheck, Wheat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { previewTasks } from './preview-data';
import { StaffTable } from './StaffTable';
interface Props {
  base: string;
  onBatch: () => void;
}
/**
 * @description Prioritizes production staff's current shift, pending work and own batch history.
 * @param props Preview route base and batch draft action.
 * @returns Production home without cross-department private data.
 */
export function StaffHome({ base, onBatch }: Props) {
  return (
    <>
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">Wednesday, 04 November 2026 · Sample shift</p>
          <h1>Good morning, Ada.</h1>
          <p>Here’s what’s on your production floor today.</p>
        </div>
        <Button className="sw-primary" onClick={onBatch}>
          Record a batch <ArrowUpRight size={16} />
        </Button>
      </header>
      <section className="sw-shift-banner" aria-label="Current shift">
        <span className="sw-state sw-open">Open shift</span>
        <strong>Morning · 06:00–14:00</strong>
        <span>Production / Ikeja branch</span>
        <Link to={`${base}/schedule`}>
          View my schedule <ArrowRight size={14} />
        </Link>
      </section>
      <section className="sw-stats" aria-label="My shift summary">
        {[
          {
            label: 'Batches recorded',
            value: '3',
            note: 'In your current shift',
            Icon: ClipboardList,
          },
          { label: 'Units submitted', value: '590', note: 'Across two product sizes', Icon: Wheat },
          {
            label: 'Awaiting acceptance',
            value: '250',
            note: 'Physical receiving still required',
            Icon: PackageCheck,
          },
          { label: 'Scheduled shift', value: '8 hrs', note: 'Ends at 14:00', Icon: Clock3 },
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
          {previewTasks.map((task, i) => (
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
                <Link className="sw-quiet" to={`${base}/records/BAT-0184`}>
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
          <Link to={`${base}/records/BAT-0186`}>
            Review pending transfer <ArrowRight size={14} />
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
          Production records only · Values shown are sample data.
        </div>
      </section>
    </>
  );
}
