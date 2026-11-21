import { useWorkspace as useFormWorkspace } from '../integration/workspace';
import { useDepartmentData, useDraftKey } from '../integration/workspace';
import { Button } from '../../components/shared/Button';
/** @file A local UI workspace draft, deliberately separate from stock posting. */
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { parseBatchDraft, validateBatchDraft } from './draft';
import type { BatchDraftValues } from './draft';
interface Props {
  onClose: () => void;
  onSaved: () => void;
  onSubmitBatch?: (values: BatchDraftValues) => Promise<string | null>;
}
/**
 * @description Captures a batch draft in browser storage; never submits stock or an authenticated mutation.
 * @param props Close and saved callbacks owned by the workspace shell.
 * @returns Native modal with focus containment, input errors and storage-failure feedback.
 */
export function BatchDraftDialog({ onClose, onSaved, onSubmitBatch }: Props) {
  const { busy } = useFormWorkspace();
  const draftKey = useDraftKey('production');
  const products = useDepartmentData('production').products;
  const [recovered] = useState(() => {
    try {
      return parseBatchDraft(localStorage.getItem(draftKey));
    } catch {
      return null;
    }
  });
  const dialog = useRef<HTMLDialogElement>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof BatchDraftValues, string>>>({});
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  const quantityFields: {
    name: 'output' | 'flour' | 'sugar' | 'yeast' | 'waste';
    label: string;
    value: string;
  }[] = [
    { name: 'output', label: 'Finished output (units)', value: recovered?.output ?? '' },
    { name: 'flour', label: 'Flour consumed (bags)', value: recovered?.flour ?? '' },
    { name: 'sugar', label: 'Sugar consumed (kg)', value: recovered?.sugar ?? '0' },
    { name: 'yeast', label: 'Yeast consumed (kg)', value: recovered?.yeast ?? '0' },
    { name: 'waste', label: 'Scrap / waste (units)', value: recovered?.waste ?? '0' },
  ];
  return (
    <dialog className="sw-dialog" ref={dialog} onCancel={onClose} aria-labelledby="batch-title">
      <div className="sw-dialog-heading">
        <div>
          <p className="sw-eyebrow">Production / Batch draft</p>
          <h2 id="batch-title">Record a production batch</h2>
        </div>
        <button className="sw-icon-button" aria-label="Close batch draft" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <p className="sw-muted">
        {recovered
          ? 'Your previous draft has been restored. Saving updates this draft.'
          : 'Save your work as a draft. Drafts do not post production or change inventory.'}
      </p>
      <form
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const values = {
            product: String(form.get('product')),
            output: String(form.get('output') || ''),
            flour: String(form.get('flour') || ''),
            sugar: String(form.get('sugar') || '0'),
            yeast: String(form.get('yeast') || '0'),
            waste: String(form.get('waste') || ''),
            note: String(form.get('note') || ''),
          };
          const nextErrors = validateBatchDraft(values);
          setErrors(nextErrors);
          if (Object.keys(nextErrors).length) return;
          if (
            (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'submit-batch'
          ) {
            const failure = await onSubmitBatch?.(values);
            if (failure) setStorageError(failure);
            return;
          }
          try {
            localStorage.setItem(
              draftKey,
              JSON.stringify({
                ...values,
                product: String(form.get('product')),
                savedAt: new Date().toISOString(),
              })
            );
            onSaved();
          } catch {
            setStorageError(
              'Your browser could not save this draft. Keep this form open and try again.'
            );
          }
        }}
      >
        <fieldset disabled={busy} className="sw-form-fields">
          <label>
            Product
            <select name="product" defaultValue={recovered?.product ?? ''}>
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product}>{product}</option>
              ))}
            </select>
          </label>
          <div className="sw-form-grid">
            {quantityFields.map(({ name, label, value }) => (
              <label key={name}>
                {label}
                <input
                  name={name}
                  type="number"
                  step={['flour', 'sugar', 'yeast'].includes(name) ? '0.001' : '1'}
                  defaultValue={value}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={errors[name] ? `${name}-error` : undefined}
                />
                {errors[name] && (
                  <span className="sw-field-error" id={`${name}-error`}>
                    {errors[name]}
                  </span>
                )}
              </label>
            ))}
          </div>
          <label>
            Production notes
            <textarea
              name="note"
              aria-invalid={Boolean(errors.note)}
              aria-describedby={errors.note ? 'note-error' : undefined}
              defaultValue={recovered?.note}
              placeholder="Record material, output or waste observations."
            />
          </label>
          {errors.note && (
            <p id="note-error" role="alert" className="sw-field-error">
              {errors.note}
            </p>
          )}
          {storageError && (
            <p role="alert" className="sw-field-error">
              {storageError}
            </p>
          )}
          <div className="sw-dialog-actions">
            <button type="button" className="sw-quiet" onClick={onClose}>
              Cancel
            </button>
            <Button type="submit" className="sw-primary">
              Save draft
            </Button>
            {onSubmitBatch && (
              <button type="submit" className="sw-primary" value="submit-batch">
                Submit batch
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
