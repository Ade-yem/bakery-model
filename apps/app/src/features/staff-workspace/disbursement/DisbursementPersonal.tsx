import { StaffHeading } from '../StaffPages';

export function DisbursementPersonal({ page }: { page: string }) {
  if (page === 'profile')
    return (
      <>
        <StaffHeading title="My profile" description="Your identity and department assignment." />
        <section className="sw-panel sw-detail">
          <div className="sw-profile-heading">
            <span className="sw-avatar">CN</span>
            <div>
              <h2>Chidi Nwosu</h2>
              <p>Disbursement officer</p>
            </div>
          </div>
          <dl>
            {[
              ['Business', 'Tally Artisan Bakery'],
              ['Branch', 'Ikeja'],
              ['Department', 'Disbursement'],
              ['Shift group', 'Group A'],
              ['Account', 'disbursement@demo.tallybakery.test'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="sw-callout">
            Your manager maintains role, department and shift assignments.
          </p>
        </section>
      </>
    );
  return (
    <>
      <StaffHeading
        title="My schedule"
        description="Your assignments · 04–07 November 2026 · All times WAT"
      />
      <section className="sw-panel">
        <div className="sw-table-scroll">
          <table className="sw-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Department</th>
                <th>Shift</th>
                <th>Starts</th>
                <th>Ends</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Wed 04 Nov', 'Morning', '06:00', '14:00'],
                ['Thu 05 Nov', 'Evening', '14:00', '22:00'],
                ['Fri 06 Nov', 'Night', '22:00', 'Sat 07 Nov · 06:00'],
                ['Sat 07 Nov', 'Rest day', '—', '—'],
              ].map(([date, shift, start, end]) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>Disbursement</td>
                  <td>{shift}</td>
                  <td>{start}</td>
                  <td>{end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sw-panel-footer">Assignment changes require an authorized manager.</div>
      </section>
    </>
  );
}
