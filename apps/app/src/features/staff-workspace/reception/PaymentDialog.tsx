/** @file Additional payment evidence capture for an unsettled sample order. */
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import {
  captureTenders,
  recordPayment,
  orderTotal,
  type ReceptionOrder,
  type TenderInput,
} from './orders';
import { money } from './data';
import { TenderFields } from './TenderFields';
interface Props {
  order: ReceptionOrder;
  onClose: () => void;
  onSave: (order: ReceptionOrder) => string | null;
}
/**
 * @description Validates additional tender components while preserving prior payment entries.
 * @param props Current order and local persistence callbacks.
 * @returns Keyboard-contained payment dialog; errors keep entered values intact.
 */
export function PaymentDialog({ order, onClose, onSave }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState<TenderInput>({
    cash: '0',
    transfer: '0',
    debt: '0',
    reference: '',
  });
  const [error, setError] = useState('');
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const remaining = orderTotal(order.lines) - order.payments.reduce((sum, p) => sum + p.amount, 0);
  return (
    <dialog
      ref={ref}
      className="sw-dialog rc-form"
      onCancel={onClose}
      aria-labelledby="payment-title"
    >
      <div className="sw-dialog-heading">
        <div>
          <p className="sw-eyebrow">{order.id} · Preview only</p>
          <h2 id="payment-title">Record payment</h2>
        </div>
        <button className="sw-icon-button" onClick={onClose} aria-label="Close payment">
          <X size={18} />
        </button>
      </div>
      <p>
        Unallocated: <strong className="rc-money">{money.format(remaining / 100)}</strong>
      </p>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          try {
            const additions = captureTenders(value);
            if (!additions.length) throw new Error('Enter at least one payment amount.');
            const failure = onSave(recordPayment(order, additions));
            if (failure) setError(failure);
            else onClose();
          } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Payment could not be captured.');
          }
        }}
      >
        <TenderFields value={value} onChange={setValue} />
        {error && (
          <p role="alert" className="sw-field-error">
            {error}
          </p>
        )}
        <div className="sw-dialog-actions">
          <button className="sw-quiet" type="button" onClick={onClose}>
            Cancel
          </button>
          <Button type="submit">Save preview payment</Button>
        </div>
      </form>
    </dialog>
  );
}
