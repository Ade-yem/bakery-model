import './journal.css';
import { useState } from 'react';
import { useWorkspace } from '../../integration/workspace';
import { StaffHeading } from '../StaffPages';
export function JournalPage({ department }: { department: string }) {
  const { data } = useWorkspace();
  const snapshot = {
    entries: data.scope.department === department ? (data.pendingWork ?? []) : [],
    untracked: data.pendingWork === null,
  };
  const [filter, setFilter] = useState('ALL');
  const entries = snapshot.entries.filter((event) => filter === 'ALL' || event.state === filter);
  return (
    <>
      <StaffHeading
        title="Pending work & conflicts"
        description="Saved changes stay on this device until the service acknowledges them. Never clear browser data while work is pending."
      />
      <>
        <section className="sw-panel sw-detail">
          <h2>Queue status</h2>
          {snapshot.untracked && (
            <p className="sw-callout">
              Pending-work status is unavailable. Keep this device's saved data and retry later.
            </p>
          )}
          {!snapshot.untracked && (
            <p>
              {snapshot.entries.filter((event) => event.state === 'PENDING').length} pending ·{' '}
              {snapshot.entries.filter((event) => event.state === 'CONFLICT').length}{' '}
              {snapshot.entries.filter((event) => event.state === 'CONFLICT').length === 1
                ? 'conflict'
                : 'conflicts'}
            </p>
          )}
          <p className="sw-muted">
            Manual synchronization is available when an authenticated transport is connected.
            Conflict evidence is read-only here; an authorized resolution must preserve the original
            event.
          </p>
          <label className="jo-filter">
            Show changes
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All changes</option>
              <option value="PENDING">Pending</option>
              <option value="CONFLICT">Conflicts</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
            </select>
          </label>
        </section>
        <section className="sw-panel rc-spaced">
          <div className="sw-table-scroll">
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Sequence</th>
                  <th>Record group</th>
                  <th>Saved</th>
                  <th>State</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {[...entries].reverse().map((event) => (
                  <tr key={event.id}>
                    <td>{event.sequence}</td>
                    <td>
                      {event.recordKey.includes('dual-handover')
                        ? 'Shift handover'
                        : event.recordKey.includes('production-records')
                          ? 'Production batch'
                          : event.recordKey.includes('disbursement-records')
                            ? 'Stock movement'
                            : event.recordKey.includes('procurement-records')
                              ? 'Material receipt'
                              : event.recordKey.includes('repayments')
                                ? 'Customer repayment'
                                : 'Order / payment'}
                    </td>
                    <td>
                      {new Date(event.at).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} WAT
                    </td>
                    <td>
                      <span className="sw-label">{event.state}</span>
                    </td>
                    <td>{event.message || 'Awaiting acknowledgement'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!snapshot.untracked && !entries.length && (
            <div className="sw-empty">
              <h2>No matching changes</h2>
              <p>Saved operational changes appear here. Drafts remain separate until submitted.</p>
            </div>
          )}
        </section>
      </>
    </>
  );
}
