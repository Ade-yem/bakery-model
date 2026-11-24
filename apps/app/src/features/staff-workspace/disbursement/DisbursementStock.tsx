import { useWorkspace as useFormWorkspace } from '../../integration/workspace';
import { useDepartmentData } from '../../integration/workspace';
import { Allowed } from '../Allowed';
import { useState } from 'react';
import { StaffHeading } from '../StaffPages';
import { balances, type Product, type State, type Action } from './model';

export function DisbursementStock({
  state,
  onSave,
}: {
  state: State;
  onSave: (action: Action) => Promise<string | null>;
}) {
  const { busy } = useFormWorkspace();
  const data = useDepartmentData('disbursement');
  const products = data.products;
  const [product, setProduct] = useState<Product>('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const stock = balances(state, data.opening);
  const count = state.events.filter((e) => e.kind === 'count' && e.product === product).at(-1);
  return (
    <>
      <StaffHeading
        title="Stock & closing counts"
        description="Accepted movements determine expected stock. Counts record evidence; they do not adjust balances or seal a shift."
      />
      <section className="sw-panel">
        <div className="sw-table-scroll">
          <table className="sw-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Opening units</th>
                <th scope="col">Available units</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(products) as Product[]).map((key) => (
                <tr key={key}>
                  <td>{products[key]}</td>
                  <td>{data.opening[key] ?? 'Unavailable'}</td>
                  <td>{stock[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="sw-panel sw-detail db-detail">
        <h2>Record physical count</h2>
        <p className="sw-muted">
          An independent incoming count and co-sign are required before the shift can be sealed.
        </p>
        <form
          className="db-form"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (!/^\d+$/.test(quantity)) {
              setError('Enter a whole-unit physical count.');
              return;
            }
            const result = await onSave({
              kind: 'count',
              id: product,
              quantity: Number(quantity),
              note,
            });
            setError(result ?? '');
            if (!result) {
              setQuantity('');
              setNote('');
            }
          }}
        >
          <fieldset disabled={busy} className="sw-form-fields">
            <label>
              Product
              <select
                value={product}
                onChange={(e) => {
                  setProduct(e.target.value as Product);
                  setQuantity('');
                  setNote('');
                  setError('');
                }}
              >
                <option value="">Select product</option>
                {(Object.keys(products) as Product[]).map((key) => (
                  <option key={key} value={key}>
                    {products[key]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Physical count (units)
              <input
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <label>
              Variance explanation
              <textarea
                value={note}
                maxLength={500}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Required when physical and expected counts differ"
              />
            </label>
            {error && (
              <p role="alert" className="sw-field-error">
                {error}
              </p>
            )}
            <Allowed action="stock:count">
              <button className="sw-primary">Save physical count</button>
            </Allowed>
          </fieldset>
        </form>
        {count && (
          <p className="sw-callout">
            Latest evidence: {count.quantity} counted / {count.expected} expected · variance{' '}
            {count.quantity - count.expected}. {count.note} Subsequent movements may change current
            expected stock.
          </p>
        )}
      </section>
    </>
  );
}
