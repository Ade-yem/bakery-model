import { StaffHeading } from '../StaffPages';
export function ProcurementPersonal({ page }: { page: string }) {
  if (page === 'profile')
    return (
      <>
        <StaffHeading title="My profile" description="Your identity and procurement assignment" />
        <section className="sw-panel sw-detail">
          <div className="sw-profile-heading">
            <span className="sw-avatar">BA</span>
            <div>
              <h2>Bisi Afolayan</h2>
              <p>Procurement officer</p>
            </div>
          </div>
          <dl>
            {[
              ['Business', 'Tally Artisan Bakery'],
              ['Branch', 'Ikeja'],
              ['Department', 'Procurement'],
              ['Shift group', 'Group B'],
              ['Account', 'procurement@demo.tallybakery.test'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="sw-callout">Contact your manager for assignment and access changes.</p>
        </section>
      </>
    );
  return (
    <>
      <StaffHeading
        title="My schedule"
        description="Your assignments · 02–08 November 2026 · All times WAT"
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
                ['Mon 02 Nov', 'Morning', '06:00', '14:00'],
                ['Tue 03 Nov', 'Morning', '06:00', '14:00'],
                ['Wed 04 Nov', 'Morning', '06:00', '14:00'],
                ['Thu 05 Nov', 'Evening', '14:00', '22:00'],
                ['Fri 06 Nov', 'Night', '22:00', 'Sat 07 Nov · 06:00'],
                ['Sat 07 Nov', 'Rest day', '—', '—'],
                ['Sun 08 Nov', 'Rest day', '—', '—'],
              ].map(([date, shift, start, end]) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>Procurement</td>
                  <td>{shift}</td>
                  <td>{start}</td>
                  <td>{end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sw-panel-footer">Contact your manager to change your schedule.</div>
      </section>
    </>
  );
}
