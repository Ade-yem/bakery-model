/** @file Shared cash/transfer/debt fields; credit is visibly distinct from received funds. */
import type { TenderInput } from './orders';
interface Props {
  value: TenderInput;
  onChange: (value: TenderInput) => void;
}
/**
 * @description Captures split tender evidence without marking a bank transfer verified.
 * @param props Controlled currency fields and update callback.
 * @returns Explicit tender fields and the required reference input.
 */
export function TenderFields({ value, onChange }: Props) {
  const fields = [
    { key: 'cash', label: 'Cash received (₦)' },
    { key: 'transfer', label: 'Bank transfer (₦)' },
    { key: 'debt', label: 'Customer credit (₦)' },
  ] as const;
  return (
    <fieldset className="rc-tender">
      <legend>Payment allocation</legend>
      <p>Cash affects the drawer. Bank transfers and customer credit do not.</p>
      <div className="rc-form-grid">
        {fields.map(({ key, label }) => (
          <label key={key}>
            {label}
            <input
              name={key}
              inputMode="decimal"
              value={value[key]}
              onChange={(event) => onChange({ ...value, [key]: event.target.value })}
            />
          </label>
        ))}
      </div>
      <label>
        Bank transfer reference / note
        <input
          value={value.reference}
          onChange={(event) => onChange({ ...value, reference: event.target.value })}
          aria-required={value.transfer !== '0' && value.transfer !== ''}
          placeholder="Required when recording a transfer"
        />
      </label>
      <p className="sw-muted">
        Recording transfer evidence is separate from bank verification. Credit dispatch requires an
        authorized policy; Reception cannot approve its own credit.
      </p>
    </fieldset>
  );
}
