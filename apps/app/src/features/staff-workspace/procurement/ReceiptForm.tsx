import { useWorkspace as useFormWorkspace } from '../../integration/workspace';
import { useDepartmentData, useDraftKey } from '../../integration/workspace';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StaffHeading } from '../StaffPages';
import { parseDraft, receiptTotal, formatMoney, type ReceiptInput } from './model';

export function ReceiptForm({
  base,
  onSave,
}: {
  base: string;
  onSave: (input: ReceiptInput) => Promise<string | null>;
}) {
  const { busy } = useFormWorkspace();
  const { suppliers, materials } = useDepartmentData('procurement');
  const draftKey = useDraftKey('procurement');
  const [recovery] = useState(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      return {
        draft: parseDraft(raw),
        error:
          raw !== null && !parseDraft(raw)
            ? 'Saved draft could not be read. It has not been overwritten.'
            : '',
      };
    } catch {
      return {
        draft: null,
        error: 'Browser draft storage is unavailable. Allow storage and reload.',
      };
    }
  });
  const [values, setValues] = useState<ReceiptInput>(
    () =>
      recovery.draft ?? {
        id: `REC-${crypto.randomUUID()}`,
        supplierId: '',
        materialId: '',
        quantity: '',
        unitCost: '',
        reference: '',
        receivedOn: new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' }),
        note: '',
      }
  );
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(
    recovery.draft ? 'Your previous draft has been restored.' : ''
  );
  const update = (key: keyof ReceiptInput, value: string) => {
    setValues({ ...values, [key]: value });
    setError('');
    setNotice('');
  };
  let total = '—';
  try {
    total = formatMoney(
      receiptTotal(values.quantity, values.unitCost) +
        (values.additionalLines ?? []).reduce(
          (sum, line) => sum + receiptTotal(line.quantity, line.unitCost),
          0
        )
    );
  } catch {
    /* Incomplete inputs. */
  }
  return (
    <>
      <StaffHeading
        title="Record material receipt"
        description="Record the supplier, material and physical quantity received."
      />
      <Link className="sw-quiet" to={`${base}/records`}>
        Back to receipts
      </Link>
      <section className="sw-panel sw-detail pc-detail">
        <h2>Delivery details</h2>
        <p className="sw-muted">
          Check the supplier reference, received quantity and unit cost against the delivery. Saved
          recorded receipts are read-only.
        </p>
        {recovery.error ? (
          <p role="alert" className="sw-field-error">
            {recovery.error} Reload after restoring valid storage.
          </p>
        ) : (
          <form
            noValidate
            className="pc-form"
            onSubmit={async (event) => {
              event.preventDefault();
              const result = await onSave(values);
              if (result) setError(result);
            }}
          >
            <fieldset disabled={busy} className="sw-form-fields">
              <label>
                Supplier
                <select
                  value={values.supplierId}
                  onChange={(e) => update('supplierId', e.target.value)}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Material
                <select
                  value={values.materialId}
                  onChange={(e) => update('materialId', e.target.value)}
                >
                  <option value="">Select material</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {m.unit}
                    </option>
                  ))}
                </select>
              </label>
              <div className="pc-grid">
                <label>
                  Quantity ({materials.find((m) => m.id === values.materialId)?.unit})
                  <input
                    aria-label="Received quantity"
                    inputMode="decimal"
                    value={values.quantity}
                    onChange={(e) => update('quantity', e.target.value)}
                  />
                </label>
                <label>
                  Unit cost (₦)
                  <input
                    inputMode="decimal"
                    value={values.unitCost}
                    onChange={(e) => update('unitCost', e.target.value)}
                  />
                </label>
              </div>
              <p className="sw-callout">
                Receipt total: <strong>{total}</strong> · Quantity supports three decimal places;
                cost supports two. Totals round to the nearest kobo.
              </p>
              {(values.additionalLines ?? []).map((line, index) => (
                <fieldset key={index} className="pc-form">
                  <legend>Material line {index + 2}</legend>
                  <label>
                    Additional material {index + 2}
                    <select
                      value={line.materialId}
                      onChange={(event) =>
                        setValues({
                          ...values,
                          additionalLines: values.additionalLines!.map((item, i) =>
                            i === index ? { ...item, materialId: event.target.value } : item
                          ),
                        })
                      }
                    >
                      <option value="">Select material</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} · {m.unit}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="pc-grid">
                    <label>
                      Quantity line {index + 2}
                      <input
                        inputMode="decimal"
                        value={line.quantity}
                        onChange={(event) =>
                          setValues({
                            ...values,
                            additionalLines: values.additionalLines!.map((item, i) =>
                              i === index ? { ...item, quantity: event.target.value } : item
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Unit cost line {index + 2} (₦)
                      <input
                        inputMode="decimal"
                        value={line.unitCost}
                        onChange={(event) =>
                          setValues({
                            ...values,
                            additionalLines: values.additionalLines!.map((item, i) =>
                              i === index ? { ...item, unitCost: event.target.value } : item
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                  <button
                    className="sw-quiet"
                    type="button"
                    onClick={() =>
                      setValues({
                        ...values,
                        additionalLines: values.additionalLines!.filter((_, i) => i !== index),
                      })
                    }
                  >
                    Remove material line {index + 2}
                  </button>
                </fieldset>
              ))}
              <button
                type="button"
                className="sw-quiet"
                disabled={(values.additionalLines?.length ?? 0) >= 49}
                onClick={() =>
                  setValues({
                    ...values,
                    additionalLines: [
                      ...(values.additionalLines ?? []),
                      { materialId: '', quantity: '', unitCost: '' },
                    ],
                  })
                }
              >
                Add material line
              </button>
              <label>
                Invoice / delivery reference
                <input
                  maxLength={80}
                  value={values.reference}
                  onChange={(e) => update('reference', e.target.value)}
                />
              </label>
              <label>
                Received date
                <input
                  type="date"
                  value={values.receivedOn}
                  onChange={(e) => update('receivedOn', e.target.value)}
                />
              </label>
              <label>
                Receiving note
                <textarea
                  maxLength={500}
                  value={values.note}
                  onChange={(e) => update('note', e.target.value)}
                />
              </label>
              {error && (
                <p role="alert" className="sw-field-error">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="sw-callout">
                  {notice}
                </p>
              )}
              <div className="pc-actions">
                <button className="sw-primary">Record receipt</button>
                <button
                  className="sw-quiet"
                  type="button"
                  onClick={async () => {
                    try {
                      localStorage.setItem(draftKey, JSON.stringify(values));
                      setNotice('Draft saved. The receipt has not been recorded.');
                      setError('');
                    } catch {
                      setError(
                        'Could not save draft. Your input is still here; allow storage and try again.'
                      );
                    }
                  }}
                >
                  Save draft
                </button>
              </div>
            </fieldset>
          </form>
        )}
      </section>
    </>
  );
}
