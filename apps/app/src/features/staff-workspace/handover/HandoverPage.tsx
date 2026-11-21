import { useWorkspace as useFormWorkspace } from '../../integration/workspace';
import { useStaffActions } from '../policy';
import { useWorkspace } from '../../integration/workspace';
import { useState } from 'react';
import { StaffHeading } from '../StaffPages';
import { submitOutgoing, signIncoming, type CountLine } from './model';
import './handover.css';
interface Props {
  department: 'reception' | 'disbursement';
  lines: CountLine[];
  actor: string;
}
export function HandoverPage({ department, lines, actor }: Props) {
  const { busy } = useFormWorkspace();
  const permissions = useStaffActions();
  const workspace = useWorkspace();
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const record = workspace.data.handover;
  const signed = record?.status === 'SEALED_PENDING_SYNC';
  const format = (value: number, line: CountLine) =>
    line.scale === 100
      ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value / 100)
      : `${value} units`;
  return (
    <>
      <StaffHeading
        title="Closing & handover"
        description="Independent counts, two signatures and a clear reconciliation trail."
      />
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
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              setNotice('');
              try {
                permissions.require(record ? 'handover:sign' : 'handover:submit');
                if (!checked)
                  throw new Error('Confirm that you independently performed the physical count.');
                if (!record) {
                  submitOutgoing(lines, counts, note, actor);
                  await workspace.submit({ type: 'handover:submit', counts, note });
                  setNotice(
                    'Outgoing handover submitted. The incoming lead must independently verify and co-sign.'
                  );
                } else {
                  signIncoming(record, counts, note, actor, lines);
                  await workspace.submit({ type: 'handover:sign', counts, note });
                  setNotice(
                    'Incoming verification recorded. Handover is pending server acknowledgement.'
                  );
                }
                setCounts({});
                setNote('');
                setChecked(false);
              } catch (failure) {
                setError(
                  failure instanceof Error
                    ? failure.message
                    : 'Could not save the handover. Your counts are retained.'
                );
              }
            }}
          >
            <fieldset disabled={busy} className="sw-form-fields">
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
                <p className="sw-callout">
                  Co-signing uses your signed-in identity. The incoming lead must sign in with their
                  own authorized account.
                </p>
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
                  disabled={
                    !permissions.allowed(record ? 'handover:sign' : 'handover:submit') ||
                    record?.outgoing.actor === actor
                  }
                >
                  {record ? 'Verify & co-sign handover' : 'Submit outgoing handover'}
                </button>
                <button
                  className="sw-quiet"
                  type="button"
                  onClick={() => {
                    void workspace
                      .reload()
                      .catch(() =>
                        setError('Handover could not be reloaded. Your input is retained.')
                      );
                    setError('');
                  }}
                >
                  Reload saved evidence
                </button>
              </div>
            </fieldset>
          </form>
        )}
        {notice && (
          <p role="status" className="sw-callout">
            {notice}
          </p>
        )}
      </>
    </>
  );
}
