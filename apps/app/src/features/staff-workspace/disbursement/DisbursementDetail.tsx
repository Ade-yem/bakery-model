import { useStaffActions } from '../policy';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StaffHeading } from '../StaffPages';
import { balances, getOrders, products, getTransfers, type Action, type State } from './model';

export function DisbursementDetail({
  id,
  state,
  base,
  onSave,
}: {
  id: string;
  state: State;
  base: string;
  onSave: (action: Action) => string | null;
}) {
  const permissions = useStaffActions();
  const transfer = getTransfers().find((item) => item.id === id);
  const order = getOrders().find((item) => item.id === id);
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const item = transfer ?? order;
  if (!item)
    return (
      <>
        <StaffHeading
          title="Record not found"
          description="This reference is not available to your department."
        />
        <Link to={`${base}/records`}>Back to records</Link>
      </>
    );
  const event = state.events.find(
    (e) => e.id === id && e.kind === (transfer ? 'accept' : 'fulfill')
  );
  const stock = balances(state);
  const requiredLines = order?.lines ?? [{ product: item.product, quantity: order?.quantity ?? 0 }];
  const sufficient = requiredLines.every((line) => stock[line.product] >= line.quantity);
  const available = stock[item.product];
  const expected = transfer?.submitted ?? order!.quantity;
  return (
    <>
      <StaffHeading
        title={id}
        description={
          transfer
            ? 'Production → Disbursement · Independent physical count'
            : `${order!.reference} · Explicitly pushed by Reception`
        }
      />
      <Link className="sw-quiet" to={`${base}/records`}>
        Back to records
      </Link>
      <section className="sw-panel sw-detail db-detail">
        <h2>{order?.lines && order.lines.length > 1 ? 'Order items' : products[item.product]}</h2>
        {order?.lines && (
          <div className="sw-table-scroll">
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Requested</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line) => (
                  <tr key={line.product}>
                    <td>{products[line.product]}</td>
                    <td>{line.quantity} units</td>
                    <td>{stock[line.product]} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <dl>
          <div>
            <dt>{transfer ? 'Submitted quantity' : 'Requested quantity'}</dt>
            <dd>{expected} units</dd>
          </div>
          <div>
            <dt>Accepted stock available</dt>
            <dd>{available} units</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              {event
                ? transfer
                  ? 'Accepted'
                  : 'Fulfilled'
                : transfer
                  ? 'Awaiting physical count'
                  : 'Ready to pack'}
            </dd>
          </div>
        </dl>
        {event ? (
          <>
            <p className="sw-callout">
              {transfer
                ? `${event.quantity} units received · Difference ${event.quantity - event.expected > 0 ? '+' : ''}${event.quantity - event.expected}`
                : `${state.events.filter((entry) => entry.kind === 'fulfill' && entry.id === id).reduce((sum, entry) => sum + entry.quantity, 0)} units fulfilled`}
              . Recorded.
            </p>
            {event.note && <p>Explanation: {event.note}</p>}
            <p className="sw-muted">This completed record cannot be submitted again.</p>
          </>
        ) : (
          <form
            className="db-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!confirmed) {
                setError('Confirm the physical check before continuing.');
                return;
              }
              if (transfer && !/^\d+$/.test(quantity)) {
                setError('Enter the actual received quantity in whole units.');
                return;
              }
              const result = onSave(
                transfer
                  ? { kind: 'accept', id, quantity: Number(quantity), note }
                  : { kind: 'fulfill', id }
              );
              setError(result ?? '');
            }}
          >
            {transfer ? (
              <>
                <label>
                  Actual received (units)
                  <input
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      setConfirmed(false);
                    }}
                  />
                </label>
                <p className="sw-muted">
                  Enter your own count. Submitted output is not available stock until accepted.
                </p>
                <label>
                  Difference explanation
                  <textarea
                    maxLength={500}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Required when received and submitted quantities differ"
                  />
                </label>
              </>
            ) : (
              <p className="sw-callout">
                Check all {expected} units against {order!.reference}. Confirmation deducts the full
                quantity from available stock; partial fulfillment is not supported.
              </p>
            )}
            <label className="db-check">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              {transfer
                ? 'I independently counted the received units.'
                : 'I checked and handed over the full order.'}
            </label>
            {error && (
              <p role="alert" className="sw-field-error">
                {error}
              </p>
            )}
            {!transfer && !sufficient && (
              <p className="sw-callout">
                Insufficient accepted stock. Review incoming transfers before fulfillment.
              </p>
            )}
            <button
              className="sw-primary"
              disabled={
                (!transfer && !sufficient) ||
                !permissions.allowed(transfer ? 'transfer:accept' : 'orders:fulfill')
              }
            >
              {transfer ? 'Confirm acceptance' : 'Confirm fulfillment'}
            </button>
          </form>
        )}
      </section>
    </>
  );
}
