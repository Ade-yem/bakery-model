import { StaffPersonal } from './StaffPersonal';
import { useDepartmentData } from '../integration/workspace';
import { Allowed } from './Allowed';
import { useProductionRecords } from './production-store';
import { Button } from '../../components/shared/Button';
/** @file Supporting staff pages; records are supplied by the assigned workspace. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import { StaffTable } from './StaffTable';
interface Props {
  base: string;
  onBatch: () => void;
  recordId?: string;
}
/**
 * @description Provides an accessible title hierarchy for staff subpages.
 * @param props Page title and supporting description.
 * @returns Workspace heading.
 */
export function StaffHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="sw-page-header">
      <div>
        <p className="sw-eyebrow">My workspace</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}
/**
 * @description Lists department tasks without exposing other departments' controls.
 * @param props Workspace base and local draft action.
 * @returns Assigned production task page.
 */
export function StaffTasks({ base, onBatch }: Props) {
  const productionTasks = useDepartmentData('production').tasks;
  return (
    <>
      <StaffHeading
        title="Department tasks"
        description="The work assigned to you for this production shift."
      />
      <section className="sw-panel">
        {!productionTasks.length && (
          <div className="sw-empty">
            <h2>No assigned tasks</h2>
            <p>Assigned work will appear here.</p>
          </div>
        )}
        {productionTasks.map((task) => (
          <article className="sw-task-detail" key={task.id}>
            <div>
              <span className="sw-eyebrow">{task.id}</span>
              <h2>{task.title}</h2>
              <p>{task.detail}</p>
              <p className="sw-muted">{task.note}</p>
            </div>
            {task.kind === 'batch' ? (
              <Allowed action="production:create">
                <Button className="sw-primary" onClick={onBatch}>
                  Record batch
                  <ArrowUpRight size={16} />
                </Button>
              </Allowed>
            ) : (
              <Link className="sw-quiet" to={`${base}/records/${task.batchId}`}>
                Review batch
                <ArrowUpRight size={16} />
              </Link>
            )}
          </article>
        ))}
      </section>
    </>
  );
}
/**
 * @description Searches read-only production records by reference, product or state.
 * @param props Workspace route base.
 * @returns Batch record list with an explicit empty result state.
 */
export function StaffRecords({ base }: Pick<Props, 'base'>) {
  const [query, setQuery] = useState('');
  return (
    <>
      <StaffHeading
        title="My records"
        description="Your production entries and their receiving status."
      />
      <label className="sw-search">
        <Search size={17} />
        <span className="sw-sr-only">Search batches</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search batch, product or state…"
        />
      </label>
      <section className="sw-panel">
        <StaffTable base={base} query={query} />
      </section>
    </>
  );
}
/**
 * @description Explains submitted and physically accepted quantities without changing original records.
 * @param props Workspace route base and selected record reference.
 * @returns Immutable batch detail or a record-not-found message.
 */
export function StaffRecordDetail({ base, recordId }: Pick<Props, 'base' | 'recordId'>) {
  const record = useProductionRecords().find((item) => item.id === recordId);
  if (!record)
    return (
      <>
        <StaffHeading
          title="Record not found"
          description="This record is not available in your assigned workspace."
        />
        <Link className="sw-quiet" to={`${base}/records`}>
          Back to my records
        </Link>
      </>
    );
  const accepted =
    record.accepted !== undefined ? `${record.accepted} units` : 'Receiving count unavailable';
  return (
    <>
      <Link className="sw-back" to={`${base}/records`}>
        <ArrowLeft size={15} />
        My records
      </Link>
      <StaffHeading title={record.id} description={record.product} />
      <section className="sw-panel sw-detail">
        <h2>Batch record</h2>
        {record.receivingNote && (
          <p className="sw-callout">Receiving explanation: {record.receivingNote}</p>
        )}
        {record.note && <p className="sw-callout">{record.note}</p>}
        <dl>
          {[
            ['Recorded by', record.recordedBy ?? 'Not provided'],
            ['Submitted output', `${record.quantity} units`],
            ['Accepted output', accepted],
            ['Receiving state', record.state],
            ['Flour consumed', record.flour],
            ['Sugar consumed', record.sugar !== undefined ? `${record.sugar} kg` : 'Not recorded'],
            ['Yeast consumed', record.yeast !== undefined ? `${record.yeast} kg` : 'Not recorded'],
            ['Scrap / waste recorded', `${record.waste} units`],
            ['Record status', record.state],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="sw-callout">
          {record.state === 'Pending acceptance'
            ? 'Pending acceptance: submitted output is not available stock until Disbursement confirms the physical count.'
            : 'The production submission and receiving count are preserved separately. Differences require review, not an overwritten batch count.'}
        </p>
        <p className="sw-muted">
          Finalized records are read-only. Authorized corrections must link back to the original
          entry.
        </p>
      </section>
    </>
  );
}
/**
 * @description Renders only the current staff member's recorded production activity.
 * @returns Personal activity timeline.
 */
export function StaffHistory() {
  const records = useProductionRecords();
  return (
    <>
      <StaffHeading
        title="Activity history"
        description="Your work, in the order it was recorded."
      />
      <section className="sw-panel sw-detail">
        <h2>Production activity</h2>
        {!records.length && (
          <div className="sw-empty">
            <h3>No production activity yet</h3>
            <p>Recorded batches will appear here.</p>
          </div>
        )}
        <ol className="sw-timeline">
          {records.map((record) => (
            <li key={record.id}>
              <time>{record.time}</time>
              <div>
                <h3>Submitted {record.id}</h3>
                <p>
                  {record.quantity} units · {record.product} · {record.state}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
/**
 * @description Shows assigned shifts without providing staff administration controls.
 * @returns Personal weekly schedule with explicit overnight end dates.
 */
export function StaffSchedule() {
  return <StaffPersonal page="schedule" />;
}
export function StaffProfile() {
  return <StaffPersonal page="profile" />;
}
