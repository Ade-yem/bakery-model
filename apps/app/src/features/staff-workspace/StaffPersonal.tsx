import { useAuth } from '../integration/auth';
import { useWorkspace } from '../integration/workspace';
import { StaffHeading } from './StaffPages';
export function StaffPersonal({ page }: { page: 'profile' | 'schedule' }) {
  const { session } = useAuth();
  const { data } = useWorkspace();
  if (!session) return null;
  return (
    <>
      <StaffHeading
        title={page === 'profile' ? 'My profile' : 'My schedule'}
        description={
          page === 'profile' ? 'Your assigned account and department.' : 'Your assigned shifts.'
        }
      />
      <section className="sw-panel sw-detail">
        {page === 'profile' ? (
          <>
            <h2>{session.displayName}</h2>
            <dl>
              {[
                ['Role', session.role],
                ['Department', session.department],
                ['Business', session.tenantName],
                ['Branch', session.branchName],
                ['Account', session.email],
                ['Account status', session.accountStatus],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : data.schedule.length ? (
          <div className="sw-table-scroll">
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Shift</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.schedule.map((shift) => (
                  <tr key={shift.id}>
                    <td>{shift.label}</td>
                    <td>
                      {new Date(shift.startsAt).toLocaleString('en-GB', {
                        timeZone: shift.timeZone,
                      })}
                    </td>
                    <td>
                      {new Date(shift.endsAt).toLocaleString('en-GB', { timeZone: shift.timeZone })}
                    </td>
                    <td>{shift.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sw-empty">
            <h2>No assigned shifts</h2>
            <p>Your schedule will appear when shifts are assigned.</p>
          </div>
        )}
      </section>
    </>
  );
}
