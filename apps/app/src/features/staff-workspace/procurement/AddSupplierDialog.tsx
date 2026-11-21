/** @file Modal dialog for adding a new vendor to the procurement supplier directory. */
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { CreateSupplierInput } from './types';

interface Props {
  onClose: () => void;
  onSave: (input: CreateSupplierInput) => string | null;
}

/**
 * @description Captures and validates a new supplier entry before passing to the submission callback.
 * @param props Close callback and save handler returning an error string on failure.
 * @returns Accessible modal dialog for registering a supplier.
 */
export function AddSupplierDialog({ onClose, onSave }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Flour & Grains');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('2');
  const [error, setError] = useState('');

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedLead = Number.parseInt(leadTimeDays, 10);
    if (!Number.isSafeInteger(parsedLead) || parsedLead < 0) {
      setError('Lead time must be a nonnegative whole number of days.');
      return;
    }
    const failure = onSave({
      name,
      category,
      contactName,
      phone,
      email,
      leadTimeDays: parsedLead,
    });
    if (failure) setError(failure);
    else onClose();
  }

  return (
    <dialog
      ref={ref}
      className="sw-dialog pr-form"
      onCancel={onClose}
      aria-labelledby="add-supplier-title"
    >
      <div className="sw-dialog-heading">
        <div>
          <p className="sw-eyebrow">Vendor directory</p>
          <h2 id="add-supplier-title">Add supplier</h2>
        </div>
        <button
          className="sw-icon-button"
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      <form noValidate onSubmit={handleSubmit}>
        <label>
          Supplier name
          <input
            type="text"
            required
            placeholder="e.g. Olam Grains Nigeria"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="Flour & Grains">Flour &amp; Grains</option>
            <option value="Dairy & Shortening">Dairy &amp; Shortening</option>
            <option value="Packaging & Wraps">Packaging &amp; Wraps</option>
            <option value="Sweeteners & Yeast">Sweeteners &amp; Yeast</option>
          </select>
        </label>

        <label>
          Contact person
          <input
            type="text"
            required
            placeholder="e.g. Seyi Balogun"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
          />
        </label>

        <div className="pr-form-grid">
          <label>
            Phone
            <input
              type="tel"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label>
            Lead time (days)
            <input
              type="number"
              min={0}
              step={1}
              value={leadTimeDays}
              onChange={(event) => setLeadTimeDays(event.target.value)}
            />
          </label>
        </div>

        <label>
          Email
          <input
            type="email"
            placeholder="orders@vendor-sample.ng"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        {error && (
          <p role="alert" className="sw-field-error">
            {error}
          </p>
        )}

        <div className="sw-dialog-actions">
          <button className="sw-quiet" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="sw-primary" type="submit">
            Save supplier
          </button>
        </div>
      </form>
    </dialog>
  );
}
