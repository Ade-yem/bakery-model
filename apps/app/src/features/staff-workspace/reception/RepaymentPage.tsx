import { useStaffActions } from '../policy';
import { commitRecord } from '../journal/store';
import { useState } from 'react';
import { ReceptionHeading } from './ReceptionPages';
import { money } from './data';
import { loadReceptionRecords } from './storage';
import { loadRepayments, makeRepayment, outstanding, repaymentKey } from './repayments';
import type { ReceptionOrder } from './orders';
export function RepaymentPage({
  orders,
  onChanged,
}: {
  orders: ReceptionOrder[];
  onChanged: () => void;
}) {
  const permissions = useStaffActions();
  const [snapshot, setSnapshot] = useState(() => loadRepayments(orders));
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [id, setId] = useState(() => `RP-${crypto.randomUUID()}`);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  return (
    <>
      <ReceptionHeading
        title="Customer repayments"
        description="Record received funds against customer debt. Original credit entries remain unchanged."
      />
      {snapshot.error ? (
        <p role="alert" className="sw-callout">
          {snapshot.error}
        </p>
      ) : (
        <>
          <section className="sw-panel sw-detail">
            <form
              className="rc-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                setError('');
                setNotice('');
                try {
                  permissions.require('repayments:create');
                  const current = loadReceptionRecords();
                  if (current.error) throw new Error(current.error);
                  const ledger = loadRepayments(current.orders);
                  if (ledger.error) throw new Error(ledger.error);
                  const entry = makeRepayment(current.orders, ledger.entries, {
                    id,
                    orderId,
                    amount,
                    method,
                    reference,
                  });
                  const entries = [...ledger.entries, entry];
                  commitRecord(repaymentKey, JSON.stringify(entries));
                  setSnapshot({ entries, error: '' });
                  setId(`RP-${crypto.randomUUID()}`);
                  setAmount('');
                  setReference('');
                  setNotice('Repayment recorded. Original debt evidence has been preserved.');
                  onChanged();
                } catch (failure) {
                  setError(
                    failure instanceof Error
                      ? failure.message
                      : 'Repayment could not be saved. Your input is retained.'
                  );
                }
              }}
            >
              <h2>Record repayment</h2>
              <label>
                Customer / source order
                <select value={orderId} onChange={(e) => setOrderId(e.target.value)}>
                  <option value="">Select outstanding credit</option>
                  {orders
                    .filter((o) => outstanding(o, snapshot.entries) > 0)
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.customer} · {o.id} ·{' '}
                        {money.format(outstanding(o, snapshot.entries) / 100)}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Repayment received (₦)
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <label>
                Payment method
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="TRANSFER">Bank transfer</option>
                </select>
              </label>
              {method === 'TRANSFER' && (
                <label>
                  Bank reference
                  <input
                    maxLength={100}
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </label>
              )}
              {error && (
                <p role="alert" className="sw-field-error">
                  {error}
                </p>
              )}
              <button className="sw-primary">Record repayment</button>
            </form>
            {notice && (
              <p role="status" className="sw-callout">
                {notice}
              </p>
            )}
          </section>
          <section className="sw-panel rc-spaced">
            <div className="sw-panel-heading">
              <h2>Repayment ledger</h2>
            </div>
            <div className="sw-table-scroll">
              <table className="sw-table">
                <thead>
                  <tr>
                    <th>Source order</th>
                    <th>Amount received</th>
                    <th>Method / reference</th>
                    <th>Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {[...snapshot.entries].reverse().map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.orderId}</td>
                      <td>{money.format(entry.amount / 100)}</td>
                      <td>
                        {entry.method} {entry.reference}
                      </td>
                      <td>
                        {new Date(entry.at).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })}{' '}
                        WAT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!snapshot.entries.length && (
              <div className="sw-empty">
                <h3>No repayments yet</h3>
                <p>Received repayments will appear here, linked to their original orders.</p>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
