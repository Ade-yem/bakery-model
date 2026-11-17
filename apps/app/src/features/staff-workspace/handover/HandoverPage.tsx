import { useStaffActions } from '../policy';
import { readRecord, commitRecord } from '../journal/store';
import { useState } from 'react';
import { StaffHeading } from '../StaffPages';
import { verifyIncoming } from '../../mock-auth/session';
import {
  submitOutgoing,
  signIncoming,
  parseHandover,
  type CountLine,
  type Handover,
} from './model';
import './handover.css';
interface Props {
  department: 'reception' | 'disbursement';
  lines: CountLine[];
  actor: string;
  currentLines?: () => CountLine[];
}
export function HandoverPage({ department, lines, actor, currentLines }: Props) {
  const permissions = useStaffActions();
  const key = `tallybakery:${department}:dual-handover:v1`;
  const load = () => {
    try {
      const raw = readRecord(key);
      const record = raw === null ? null : parseHandover(raw);
      return {
        record,
        error:
          raw !== null && !record
            ? 'Saved handover evidence is invalid. It has not been overwritten.'
            : '',
      };
    } catch {
      return {
        record: null,
        error: 'Handover storage is unavailable. Allow browser storage, then retry.',
      };
    }
  };
  const [snapshot, setSnapshot] = useState<{ record: Handover | null; error: string }>(load);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const record = snapshot.record;
  const signed = record?.status === 'SEALED_PENDING_SYNC';
  const format = (value: number, line: CountLine) =>
    line.scale === 100
      ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value / 100)
      : `${value} units`;
  function save(next: Handover) {
    commitRecord(key, JSON.stringify(next));
    setSnapshot({ record: next, error: '' });
    setCounts({});
    setNote('');
    setPassword('');
    setChecked(false);
  }
  return (
    <>
      <StaffHeading
        title="Closing & handover"
        description="Independent counts, two signatures and a clear reconciliation trail."
      />
      {snapshot.error ? (
        <section className="sw-panel sw-detail">
          <p role="alert" className="sw-field-error">
            {snapshot.error}
          </p>
          <button className="sw-quiet" onClick={() => setSnapshot(load())}>
            Retry loading handover
          </button>
        </section>
      ) : (
        <>
          <section className="sw-panel">
            <div className="sw-panel-heading">
              <div>
                <h2>
                  {signed
                    ? 'Signed handover'
                    : record
                      ? 'Awaiting incoming verification'
                      : 'Outgoing physical count'}
                </h2>
                <p>
                  {signed
                    ? `${record.result} · Awaiting server acknowledgement`
                    : 'Counts are recorded separately from expected balances.'}
                </p>
              </div>
              <span className="sw-label">
                {signed ? 'Pending sync' : record ? 'Incoming signoff required' : 'Open shift'}
              </span>
            </div>
            <div className="sw-table-scroll">
              <table className="sw-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Expected</th>
                    <th>Outgoing count</th>
                    <th>Incoming count</th>
                    <th>Incoming variance</th>
                  </tr>
                </thead>
                <tbody>
                  {(record?.lines ?? lines).map((line) => (
                    <tr key={line.id}>
                      <td>{line.label}</td>
                      <td>{format(line.expected, line)}</td>
                      <td>
                        {record ? format(record.outgoing.counts[line.id], line) : 'Not submitted'}
                      </td>
                      <td>
                        {record?.incoming
                          ? format(record.incoming.counts[line.id], line)
                          : 'Not verified'}
                      </td>
                      <td>
                        {record?.incoming
                          ? format(record.incoming.counts[line.id] - line.expected, line)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {record && (
              <div className="sw-panel-footer">
                Outgoing: {record.outgoing.actor} · {record.outgoing.note || 'No variance'}
                {record.incoming && (
                  <>
                    {' '}
                    · Incoming: {record.incoming.actor} · {record.incoming.note || 'No variance'}
                  </>
                )}
              </div>
            )}
          </section>
          {signed ? (
            <p role="status" className="sw-callout">
              Both signatures are recorded. This shift is pending server validation; it is not
              finalized.{' '}
              {record.result === 'UNBALANCED' &&
                'The acknowledged deficiency remains on the record for manager review.'}
            </p>
          ) : (
            <form
              className="sw-panel sw-detail ho-form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                setError('');
                setNotice('');
                try {
                  permissions.require(record ? 'handover:sign' : 'handover:submit');
                  if (!checked)
                    throw new Error('Confirm that you independently performed the physical count.');
                  const latest = load();
                  if (latest.error) throw new Error(latest.error);
                  if (JSON.stringify(latest.record) !== JSON.stringify(record))
                    throw new Error(
                      'Another person updated this handover. Reload the saved evidence before continuing.'
                    );
                  if (!record) {
                    save(submitOutgoing(lines, counts, note, actor));
                    setNotice(
                      'Outgoing handover submitted. The incoming lead must independently verify and co-sign.'
                    );
                  } else {
                    const incomingActor = verifyIncoming(department, email, password);
                    save(
                      signIncoming(record, counts, note, incomingActor, currentLines?.() ?? lines)
                    );
                    setNotice(
                      'Incoming verification recorded. Handover is pending server acknowledgement.'
                    );
                  }
                } catch (failure) {
                  setPassword('');
                  setError(
                    failure instanceof Error
                      ? failure.message
                      : 'Could not save the handover. Your counts are retained.'
                  );
                }
              }}
            >
              <h2>{record ? 'Incoming independent count' : 'Outgoing closing count'}</h2>
              {(record?.lines ?? lines).map((line) => (
                <label key={line.id}>
                  {line.label} · physical count{line.scale === 100 ? ' (₦)' : ' (units)'}
                  <input
                    inputMode={line.scale === 100 ? 'decimal' : 'numeric'}
                    value={counts[line.id] ?? ''}
                    onChange={(e) => {
                      setCounts({ ...counts, [line.id]: e.target.value });
                      setChecked(false);
                    }}
                  />
                </label>
              ))}
              <label>
                Variance / count-difference explanation
                <textarea maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              {record && (
                <fieldset>
                  <legend>Incoming lead verification</legend>
                  <label>
                    Incoming email
                    <input
                      type="email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                  <label>
                    Incoming password
                    <input
                      type="password"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                </fieldset>
              )}
              <label className="ho-check">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                I independently counted the physical {department === 'reception' ? 'cash' : 'stock'}{' '}
                and acknowledge any recorded difference.
              </label>
              {error && (
                <p role="alert" className="sw-field-error">
                  {error}
                </p>
              )}
              <div className="ho-actions">
                <button
                  className="sw-primary"
                  disabled={!permissions.allowed(record ? 'handover:sign' : 'handover:submit')}
                >
                  {record ? 'Verify & co-sign handover' : 'Submit outgoing handover'}
                </button>
                <button
                  className="sw-quiet"
                  type="button"
                  onClick={() => {
                    setSnapshot(load());
                    setError('');
                  }}
                >
                  Reload saved evidence
                </button>
              </div>
            </form>
          )}
          {notice && (
            <p role="status" className="sw-callout">
              {notice}
            </p>
          )}
        </>
      )}
    </>
  );
}
