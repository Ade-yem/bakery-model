import { Button } from '../../components/shared/Button';
/** @file A local UI preview draft, deliberately separate from stock posting. */
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { parseBatchDraft, validateBatchDraft } from './draft';
import type { BatchDraftValues } from './draft';
interface Props {
  onClose: () => void;
  onSaved: () => void;
}
/**
 * @description Captures a sample batch draft in browser storage; never submits stock or an authenticated mutation.
 * @param props Close and saved callbacks owned by the workspace shell.
 * @returns Native modal with focus containment, input errors and storage-failure feedback.
 */
export function BatchDraftDialog({ onClose, onSaved }: Props) {
  const [recovered] = useState(() => {
    try {
      return parseBatchDraft(localStorage.getItem('tallybakery:production-preview-draft'));
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
  const quantityFields: { name: 'output' | 'flour' | 'waste'; label: string; value: string }[] = [
    { name: 'output', label: 'Finished output (units)', value: recovered?.output ?? '250' },
    { name: 'flour', label: 'Flour consumed (bags)', value: recovered?.flour ?? '5' },
    { name: 'waste', label: 'Scrap / waste (units)', value: recovered?.waste ?? '0' },
  ];
  return (
    <dialog className="sw-dialog" ref={dialog} onCancel={onClose} aria-labelledby="batch-title">
      <div className="sw-dialog-heading">
        <div>
          <p className="sw-eyebrow">Production / Preview draft</p>
          <h2 id="batch-title">Record a production batch</h2>
        </div>
        <button className="sw-icon-button" aria-label="Close batch draft" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <p className="sw-muted">
        {recovered
          ? 'Your previous preview draft has been restored. Saving replaces this one local draft.'
          : 'Saved on this browser as a sample draft. It will not submit production or change inventory.'}
      </p>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const values = {
            output: String(form.get('output') || ''),
            flour: String(form.get('flour') || ''),
            waste: String(form.get('waste') || ''),
            note: String(form.get('note') || ''),
          };
          const nextErrors = validateBatchDraft(values);
          setErrors(nextErrors);
          if (Object.keys(nextErrors).length) return;
          try {
            localStorage.setItem(
              'tallybakery:production-preview-draft',
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
        <label>
          Product
          <select name="product" defaultValue={recovered?.product}>
            <option>Family loaf · 500g</option>
            <option>Sandwich bread · 1kg</option>
          </select>
        </label>
        <div className="sw-form-grid">
          {quantityFields.map(({ name, label, value }) => (
            <label key={name}>
              {label}
              <input
                name={name}
                type="number"
                step={name === 'flour' ? 'any' : '1'}
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
            Save preview draft
          </Button>
        </div>
      </form>
    </dialog>
  );
}
