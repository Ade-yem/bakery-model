/** @file Reception order detail, payment evidence and explicit manual dispatch. */
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { money, statusLabels } from './data';
import { orderTotal, pushOrder, type ReceptionOrder } from './orders';
import { PaymentDialog } from './PaymentDialog';
interface Props {
  order?: ReceptionOrder;
  base: string;
  onSave: (order: ReceptionOrder) => string | null;
}
/**
 * @description Separates recorded money, customer debt and explicit dispatch, without fulfillment controls.
 * @param props Read-only source order, preview route base and local-save callback.
 * @returns Order detail with validated payment entry and a separate dispatch confirmation.
 */
export function OrderDetail({ order, base, onSave }: Props) {
  const confirm = useRef<HTMLDialogElement>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  if (!order)
    return (
      <>
        <h1 className="rc-title">Order not found</h1>
        <p>This order is not available in your Reception workspace.</p>
        <Link className="sw-back" to={`${base}/records`}>
          Return to orders
        </Link>
      </>
    );
  const total = orderTotal(order.lines);
  const debt = order.payments
    .filter((p) => p.method === 'DEBT')
    .reduce((sum, p) => sum + p.amount, 0);
  const received = order.payments
    .filter((p) => p.method !== 'DEBT')
    .reduce((sum, p) => sum + p.amount, 0);
  const dispatchable = ['PAID_PENDING_DISPATCH', 'CREDIT_APPROVED_PENDING_DISPATCH'].includes(
    order.status
  );
  return (
    <>
      <Link className="sw-back" to={`${base}/records`}>
        <ArrowLeft size={15} />
        Orders
      </Link>
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">Reception / Customer order</p>
          <h1>{order.id}</h1>
          <p>
            {order.customer} · {order.contact || 'Walk-in sale'}
          </p>
        </div>
        <span className="sw-label">{statusLabels[order.status]}</span>
      </header>
      <div className="rc-entry-grid">
        <section className="sw-panel">
          <div className="sw-panel-heading">
            <h2>Order lines</h2>
          </div>
          <div className="sw-table-scroll">
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit price</th>
                  <th>Line total</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line) => (
                  <tr key={line.sku}>
                    <td>{line.name}</td>
                    <td>{line.quantity}</td>
                    <td className="rc-money">{money.format(line.unitPrice / 100)}</td>
                    <td className="rc-money">
                      {money.format((line.quantity * line.unitPrice) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rc-total">
            <strong>Order total</strong>
            <strong>{money.format(total / 100)}</strong>
          </div>
          <div className="sw-panel-heading">
            <h2>Payment record</h2>
          </div>
          <div className="sw-table-scroll">
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {order.payments.map((payment, index) => (
                  <tr key={index}>
                    <td>
                      {payment.method === 'DEBT'
                        ? 'Customer credit'
                        : payment.method === 'CASH'
                          ? 'Cash'
                          : 'Bank transfer'}
                    </td>
                    <td className="rc-money">{money.format(payment.amount / 100)}</td>
                    <td>
                      {payment.reference ||
                        (payment.method === 'DEBT'
                          ? 'Receivable · not money received'
                          : 'Cash recorded')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!order.payments.length && <p className="sw-empty">No payments recorded.</p>}
          </div>
          <div className="sw-panel-footer">
            Transfer entries record evidence; bank verification is not simulated.
          </div>
        </section>
        <aside className="sw-panel sw-detail">
          <h2>Settlement & dispatch</h2>
          <dl>
            {[
              ['Money received', received],
              ['Customer credit', debt],
              ['Unallocated', total - received - debt],
            ].map(([label, amount]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className="rc-money">{money.format(Number(amount) / 100)}</dd>
              </div>
            ))}
          </dl>
          <p className="sw-callout">
            {order.status === 'PUSHED'
              ? 'Reception has explicitly pushed this sample order. Only Disbursement can record fulfillment; no stock change is made here.'
              : dispatchable
                ? 'This order is eligible for manual dispatch. Payment alone does not send it to Disbursement.'
                : debt > 0 && received + debt === total
                  ? 'Credit is recorded, but dispatch awaits authorized credit approval. Reception cannot approve its own credit.'
                  : 'Complete settlement before pushing the order to Disbursement.'}
          </p>
          {error && (
            <p className="sw-field-error" role="alert">
              {error}
            </p>
          )}
          {total - received - debt > 0 && (
            <Button variant="secondary" onClick={() => setPaying(true)}>
              Record payment
            </Button>
          )}
          {dispatchable && (
            <Button icon={<ArrowRight size={15} />} onClick={() => confirm.current?.showModal()}>
              Push to Disbursement
            </Button>
          )}
          <p className="sw-muted rc-spaced">
            Sample records are saved locally. No server dispatch or live financial posting occurs.
          </p>
        </aside>
      </div>
      {paying && <PaymentDialog order={order} onClose={() => setPaying(false)} onSave={onSave} />}
      <dialog className="sw-dialog" ref={confirm} aria-labelledby="push-title">
        <p className="sw-eyebrow">Explicit Reception handoff</p>
        <h2 id="push-title" className="rc-title">
          Push to Disbursement?
        </h2>
        <p>
          {order.id} · {order.customer}
        </p>
        <p className="sw-callout">
          {order.lines.reduce((sum, line) => sum + line.quantity, 0)} units will be marked as pushed
          in this preview. This is not fulfillment and does not deduct stock.
        </p>
        <div className="sw-dialog-actions">
          <button className="sw-quiet" onClick={() => confirm.current?.close()}>
            Cancel
          </button>
          <Button
            onClick={() => {
              try {
                const failure = onSave(pushOrder(order));
                if (failure) setError(failure);
                confirm.current?.close();
              } catch (failure) {
                setError(
                  failure instanceof Error ? failure.message : 'Dispatch could not be recorded.'
                );
                confirm.current?.close();
              }
            }}
          >
            Confirm preview push
          </Button>
        </div>
      </dialog>
    </>
  );
}
