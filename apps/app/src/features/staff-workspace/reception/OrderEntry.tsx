/** @file New-order preview; totals and split tenders are validated before local capture. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { receptionProducts, money } from './data';
import {
  orderTotal,
  recordPayment,
  captureTenders,
  type OrderLine,
  type ReceptionOrder,
  type TenderInput,
} from './orders';
import { TenderFields } from './TenderFields';
interface Props {
  base: string;
  onSave: (order: ReceptionOrder) => string | null;
}
/**
 * @description Captures customer order lines and cash/transfer/debt allocations as a local sample record.
 * @param props Preview route base and durable local-save callback; no server posting occurs here.
 * @returns Validated order-entry form with editable quantities, safe totals and recovery from errors.
 */
export function OrderEntry({ base, onSave }: Props) {
  const [lines, setLines] = useState<OrderLine[]>([{ ...receptionProducts[0], quantity: 1 }]);
  const [customer, setCustomer] = useState('');
  const [contact, setContact] = useState('');
  const [tender, setTender] = useState<TenderInput>({
    cash: '0',
    transfer: '0',
    debt: '0',
    reference: '',
  });
  const [error, setError] = useState('');
  let total = 0;
  try {
    total = orderTotal(lines);
  } catch {
    /* Invalid input remains editable; submission explains the error. */
  }
  const nextProduct = receptionProducts.find(
    (product) => !lines.some((line) => line.sku === product.sku)
  );
  return (
    <>
      <Link className="sw-back" to={`${base}/records`}>
        <ArrowLeft size={15} />
        Orders
      </Link>
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">Reception / Order entry</p>
          <h1>New customer order</h1>
          <p>Record the order. Settle payment. Push to Disbursement separately.</p>
        </div>
      </header>
      <form
        className="rc-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setError('');
          try {
            const order: ReceptionOrder = {
              id: `ORD-PREVIEW-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
              customer: customer.trim() || 'Walk-in customer',
              contact: contact.trim(),
              createdAt: new Date().toISOString(),
              lines,
              payments: [],
              status: 'PENDING_SETTLEMENT',
              creditAuthorized: false,
            };
            const settled = recordPayment(order, captureTenders(tender));
            const failure = onSave(settled);
            if (failure) setError(failure);
          } catch (failure) {
            setError(
              failure instanceof Error
                ? failure.message
                : 'The order could not be captured. Review your inputs.'
            );
          }
        }}
      >
        <div className="rc-entry-grid">
          <section className="sw-panel sw-detail">
            <h2>Customer & order</h2>
            <div className="rc-form-grid">
              <label>
                Customer name
                <input
                  value={customer}
                  onChange={(event) => setCustomer(event.target.value)}
                  placeholder="Leave blank for a walk-in sale"
                />
              </label>
              <label>
                Customer contact
                <input
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="Required for customer credit"
                />
              </label>
            </div>
            <div className="rc-line-heading">
              <h3>Products</h3>
              <button
                type="button"
                className="sw-quiet"
                disabled={!nextProduct}
                onClick={() => {
                  if (nextProduct) setLines([...lines, { ...nextProduct, quantity: 1 }]);
                }}
              >
                <Plus size={14} />
                Add product
              </button>
            </div>
            {lines.map((line) => (
              <div className="rc-order-line" key={line.sku}>
                <div>
                  <strong>{line.name}</strong>
                  <p>{money.format(line.unitPrice / 100)} / unit</p>
                </div>
                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    step="1"
                    aria-label={`Quantity for ${line.name}`}
                    value={Number.isNaN(line.quantity) ? '' : line.quantity}
                    onChange={(event) =>
                      setLines(
                        lines.map((item) =>
                          item.sku === line.sku
                            ? {
                                ...item,
                                quantity:
                                  event.target.value === '' ? NaN : Number(event.target.value),
                              }
                            : item
                        )
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  className="sw-icon-button"
                  aria-label={`Remove ${line.name}`}
                  onClick={() => setLines(lines.filter((item) => item.sku !== line.sku))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {!lines.length && (
              <p className="sw-callout">Add a product before capturing the order.</p>
            )}
            <div className="rc-total">
              <span>Order total</span>
              <strong>{money.format(total / 100)}</strong>
            </div>
          </section>
          <section className="sw-panel sw-detail">
            <TenderFields value={tender} onChange={setTender} />
            <p className="sw-callout">
              This saves a sample order on this browser. It does not send the order to Disbursement
              or change stock.
            </p>
            {error && (
              <p className="sw-field-error" role="alert">
                {error}
              </p>
            )}
            <div className="rc-form-actions">
              <Link className="sw-quiet" to={`${base}/records`}>
                Cancel
              </Link>
              <Button type="submit">Capture preview order</Button>
            </div>
          </section>
        </div>
      </form>
    </>
  );
}
