import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { ApiError } from './http';
import { createSupplier, createCustomer } from './reference-data';
import type { ApiClient } from './http';
import type { StaffSession } from '../integration/auth';
export function DirectoryDialog({
  kind,
  api,
  session,
  onClose,
  onSaved,
}: {
  kind: 'supplier' | 'customer';
  api: ApiClient;
  session: StaffSession;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    posting = useRef(false);
  const [values, setValues] = useState<Record<string, string>>({}),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [uncertain, setUncertain] = useState(false);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const fields =
    kind === 'supplier'
      ? [
          ['name', 'Supplier name'],
          ['externalReference', 'External reference'],
          ['contactName', 'Contact name'],
          ['contactPhone', 'Phone'],
          ['contactEmail', 'Email'],
        ]
      : [
          ['displayName', 'Customer name'],
          ['externalReference', 'External reference'],
          ['phone', 'Phone'],
          ['email', 'Email'],
          ['currency', 'Currency (ISO code)'],
        ];
  return (
    <dialog
      className="sw-dialog"
      ref={ref}
      aria-labelledby="directory-dialog-title"
      onCancel={(event) => {
        if (posting.current) event.preventDefault();
        else onClose();
      }}
    >
      <div className="sw-dialog-heading">
        <h2 id="directory-dialog-title">Add {kind}</h2>
        <button
          className="sw-icon-button"
          aria-label={`Close ${kind} form`}
          onClick={onClose}
          disabled={busy}
        >
          <X size={20} />
        </button>
      </div>
      <form
        className="api-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (posting.current || uncertain) return;
          setError('');
          const name = values[kind === 'supplier' ? 'name' : 'displayName']?.trim();
          if (!name) {
            setError(`Enter the ${kind} name.`);
            return;
          }
          const input = Object.fromEntries(
            Object.entries(values)
              .filter(([, value]) => value.trim())
              .map(([key, value]) => [key, value.trim()])
          );
          posting.current = true;
          setBusy(true);
          try {
            if (kind === 'supplier') await createSupplier(api, session, { ...input, name });
            else
              await createCustomer(api, session, {
                ...input,
                displayName: name,
                currency: values.currency?.trim().toUpperCase() ?? '',
              });
            onSaved();
          } catch (cause) {
            setUncertain(cause instanceof ApiError && cause.outcomeUnknown);
            setError(
              cause instanceof Error
                ? cause.message
                : 'This record could not be saved. Your input is retained.'
            );
          } finally {
            posting.current = false;
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy} className="sw-form-fields">
          {fields.map(([key, label], index) => (
            <label key={key}>
              {label}
              <input
                name={key}
                type={key.toLowerCase().includes('email') ? 'email' : 'text'}
                maxLength={120}
                value={values[key] ?? ''}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                required={index === 0 || key === 'currency'}
              />
            </label>
          ))}
        </fieldset>
        {error && (
          <p role="alert" className="sw-field-error">
            {error}
          </p>
        )}
        {uncertain && (
          <p>
            The result is unconfirmed. Close this form and check the directory before creating
            another record.
          </p>
        )}
        <div className="sw-dialog-actions">
          <button type="button" className="sw-quiet" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="sw-primary" disabled={busy || uncertain}>
            {busy ? 'Saving…' : `Save ${kind}`}
          </button>
        </div>
      </form>
    </dialog>
  );
}
