/** @file Outgoing cash handover evidence with no simulated dual-signoff or canonical seal. */
import { useState } from 'react';
import { Button } from '../../../components/shared/Button';
import { ReceptionHeading } from './ReceptionPages';
import { cashSummary, prepareHandover, parseOutgoingDraft } from './handover';
import { money } from './data';
import { parseMoney, type ReceptionOrder } from './orders';
/**
 * @description Displays the cash formula and captures a sample outgoing count, requiring notes for variances.
 * @param props Current Reception preview orders used to derive cash receipts.
 * @returns Handover draft form with explicit pending incoming-signoff boundary.
 */
export function ReceptionHandover({ orders }: { orders: ReceptionOrder[] }) {
  const summary = cashSummary(orders, 1000000, 150000);
  const [recovered] = useState(() => {
    try {
      return parseOutgoingDraft(localStorage.getItem('tallybakery:reception-handover-preview'));
    } catch {
      return null;
    }
  });
  const [physical, setPhysical] = useState(recovered?.physical ?? '');
  const [note, setNote] = useState(recovered?.note ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const counted = parseMoney(physical);
  const variance = counted === null ? null : counted - summary.expected;
  return (
    <>
      <ReceptionHeading
        title="Closing & handover"
        description="Count your drawer. Record the difference. Leave a clear account for the incoming cashier."
      />
      <div className="rc-entry-grid">
        <section className="sw-panel sw-detail">
          <h2>Expected cash · sample shift</h2>
          <dl>
            {[
              ['Opening drawer float', summary.opening],
              ['Cash received', summary.received],
              ['Approved petty cash', -summary.expenses],
              ['Expected closing cash', summary.expected],
            ].map(([label, amount]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className="rc-money">{money.format(Number(amount) / 100)}</dd>
              </div>
            ))}
          </dl>
          <p className="sw-muted rc-spaced">
            Opening float: sample opening record. Approved expense: sample manager-approved petty
            cash. Reception cannot approve or alter expenses here.
          </p>
          <p className="sw-callout">
            Bank transfers and customer debt never enter the physical cash formula.
          </p>
        </section>
        <form
          className="sw-panel sw-detail rc-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            setSaved(false);
            try {
              const draft = prepareHandover(summary.expected, physical, note);
              localStorage.setItem(
                'tallybakery:reception-handover-preview',
                JSON.stringify({
                  ...draft,
                  physical,
                  expected: summary.expected,
                  actor: 'Fatima Ahmed · sample',
                  savedAt: new Date().toISOString(),
                })
              );
              setSaved(true);
            } catch (failure) {
              setError(
                failure instanceof Error
                  ? failure.message
                  : 'The draft could not be saved. Keep your count here and retry.'
              );
            }
          }}
        >
          <h2>Outgoing count</h2>
          {recovered && (
            <p className="sw-callout">
              Previous outgoing draft restored.{' '}
              {recovered.expected !== summary.expected
                ? 'Cash receipts have changed since that draft; verify your count against the new expected amount.'
                : 'Verify the physical count before saving again.'}
            </p>
          )}
          <label>
            Physical cash counted (₦)
            <input
              inputMode="decimal"
              value={physical}
              onChange={(event) => {
                setPhysical(event.target.value);
                setSaved(false);
              }}
            />
          </label>
          {variance !== null && (
            <p className="rc-total">
              <span>Draft cash variance</span>
              <strong>
                {variance < 0
                  ? `(${money.format(Math.abs(variance) / 100)})`
                  : money.format(variance / 100)}
              </strong>
            </p>
          )}
          <label>
            Variance explanation
            <textarea
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setSaved(false);
              }}
              placeholder="Required when counted cash differs from expected cash."
            />
          </label>
          <p className="sw-muted">
            An unbalanced shift can close after the required explanation and incoming co-sign; it
            must not block the next shift. This preview captures the outgoing draft only.
          </p>
          {error && (
            <p role="alert" className="sw-field-error">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="sw-callout">
              Outgoing preview draft saved locally. Awaiting independent incoming verification and
              server validation. The shift has not been sealed.
            </p>
          )}
          <div className="rc-form-actions">
            <Button type="submit">Save outgoing preview draft</Button>
          </div>
        </form>
      </div>
    </>
  );
}
