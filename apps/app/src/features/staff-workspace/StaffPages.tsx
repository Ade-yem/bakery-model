import { Button } from '../../components/shared/Button';
/** @file Supporting staff pages; all records are synthetic production fixtures. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import { productionRecords, previewTasks } from './preview-data';
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
        <p className="sw-eyebrow">Production / My workspace</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}
/**
 * @description Lists department tasks without exposing other departments' controls.
 * @param props Preview base and local draft action.
 * @returns Assigned production task page.
 */
export function StaffTasks({ base, onBatch }: Props) {
  return (
    <>
      <StaffHeading
        title="Department tasks"
        description="The work assigned to you for this production shift."
      />
      <section className="sw-panel">
        {previewTasks.map((task) => (
          <article className="sw-task-detail" key={task.id}>
            <div>
              <span className="sw-eyebrow">{task.id} · Morning shift</span>
              <h2>{task.title}</h2>
              <p>{task.detail}</p>
              <p className="sw-muted">{task.note}</p>
            </div>
            {task.kind === 'batch' ? (
              <Button className="sw-primary" onClick={onBatch}>
                Record batch
                <ArrowUpRight size={16} />
              </Button>
            ) : (
              <Link className="sw-quiet" to={`${base}/records/BAT-0184`}>
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
 * @param props Preview route base.
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
 * @param props Preview route base and selected record reference.
 * @returns Immutable batch detail or a record-not-found message.
 */
export function StaffRecordDetail({ base, recordId }: Pick<Props, 'base' | 'recordId'>) {
  const record = productionRecords.find((item) => item.id === recordId);
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
    record.id === 'BAT-0186'
      ? 'Awaiting physical count'
      : record.id === 'BAT-0184'
        ? '238 units'
        : '100 units';
  return (
    <>
      <Link className="sw-back" to={`${base}/records`}>
        <ArrowLeft size={15} />
        My records
      </Link>
      <StaffHeading title={record.id} description={record.product} />
      <section className="sw-panel sw-detail">
        <h2>Batch record</h2>
        <dl>
          {[
            ['Recorded by', 'Ada Okonkwo · Production'],
            ['Submitted output', `${record.quantity} units`],
            ['Accepted output', accepted],
            ['Receiving state', record.state],
            ['Flour consumed', record.flour],
            ['Scrap / waste recorded', `${record.waste} units`],
            ['Server state', `${record.sync} · sample`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="sw-callout">
          {record.id === 'BAT-0186'
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
 * @description Renders only the current staff member's sample production activity.
 * @returns Personal activity timeline.
 */
export function StaffHistory() {
  return (
    <>
      <StaffHeading
        title="Activity history"
        description="Your work, in the order it was recorded."
      />
      <section className="sw-panel sw-detail">
        <h2>04 November 2026</h2>
        <ol className="sw-timeline">
          {[
            ['09:35', 'Submitted BAT-0186', '250 family loaves · pending physical acceptance'],
            ['08:40', 'Submitted BAT-0185', '100 sandwich loaves · receiving confirmed'],
            ['07:25', 'Submitted BAT-0184', '240 submitted · 238 received · difference recorded'],
            ['06:00', 'Morning shift opened', 'Production · Ikeja branch'],
          ].map(([time, title, note]) => (
            <li key={time}>
              <time>{time}</time>
              <div>
                <h3>{title}</h3>
                <p>{note}</p>
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
  return (
    <>
      <StaffHeading
        title="My schedule"
        description="Your assigned shifts for 02–08 November 2026. Sample schedule."
      />
      <section className="sw-panel">
        <div className="sw-panel-heading">
          <div>
            <h2>This week</h2>
            <p>Production · Ikeja branch · All times WAT</p>
          </div>
          <span className="sw-label">Group A</span>
        </div>
        <div className="sw-table-scroll">
          <table className="sw-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Starts</th>
                <th>Ends</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Mon 02 Nov', 'Morning', '06:00', '14:00'],
                ['Tue 03 Nov', 'Morning', '06:00', '14:00'],
                ['Wed 04 Nov', 'Morning', '06:00', '14:00'],
                ['Thu 05 Nov', 'Evening', '14:00', '22:00'],
                ['Fri 06 Nov', 'Evening', '14:00', '22:00'],
                ['Sat 07 Nov', 'Night', '22:00', 'Sun 08 Nov · 06:00'],
                ['Sun 08 Nov', 'Rest day', '—', '—'],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((value, index) => (
                    <td key={`${row[0]}-${index}`}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sw-panel-footer">
          Schedule changes require an authorized manager. Staff cannot change their own assignment.
        </div>
      </section>
    </>
  );
}
/**
 * @description Shows staff identity and assignment as read-only until profile contracts are agreed.
 * @returns Own-profile page without role or department editing controls.
 */
export function StaffProfile() {
  return (
    <>
      <StaffHeading
        title="My profile"
        description="Your account and assigned production workspace."
      />
      <section className="sw-panel sw-detail">
        <div className="sw-profile-heading">
          <span className="sw-avatar">AO</span>
          <div>
            <h2>Ada Okonkwo</h2>
            <p className="sw-muted">Production supervisor · Sample profile</p>
          </div>
        </div>
        <dl>
          {[
            ['Business', 'Tally Artisan Bakery'],
            ['Branch', 'Ikeja'],
            ['Department', 'Production'],
            ['Role', 'Production supervisor'],
            ['Shift group', 'Group A'],
            ['Account', 'ada.okonkwo · sample'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="sw-callout">
          Your manager maintains your department, role and shift assignments. Contact them if these
          details need correcting.
        </p>
      </section>
    </>
  );
}
