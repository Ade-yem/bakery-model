/** @file Accessible multi-line Purchase Order creation dialog. */
import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { calculateLinesTotal, formatMoney, parseMoney } from './domain';
import type { CreatePoInput, ProcurementSnapshot, RawMaterial } from './types';

interface DraftLine {
  materialId: string;
  quantity: string;
  unitCost: string;
}
interface Props {
  snapshot: ProcurementSnapshot;
  prefilledMaterial: RawMaterial | null;
  onClose: () => void;
  onSubmit: (input: CreatePoInput) => string | null;
}

/** @description Closes the active overlay from the standard Escape key. @param onClose Overlay close callback. @returns Nothing. */
function useEscapeClose(onClose: () => void): void {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);
}

/** @description Safely derives a live kobo total from incomplete form strings. @param lines Draft PO rows. @returns Kobo total, or null while invalid. */
function getDraftTotal(lines: DraftLine[]): number | null {
  try {
    return calculateLinesTotal(
      lines.map((line) => ({
        quantity: Number(line.quantity),
        unitCostKobo: parseMoney(line.unitCost) ?? -1,
      }))
    );
  } catch {
    return null;
  }
}

/**
 * @description Captures a supplier commitment with one or more validated raw-material lines and exact kobo totals.
 * @param props Current master data, optional reorder seed, and close/submit callbacks.
 * @returns A modal Purchase Order form with keyboard escape and inline validation.
 */
export function CreatePoDialog({ snapshot, prefilledMaterial, onClose, onSubmit }: Props) {
  const firstMaterial = prefilledMaterial ?? snapshot.materials[0];
  const [supplierId, setSupplierId] = useState(
    prefilledMaterial?.preferredSupplierId ?? snapshot.suppliers[0]?.id ?? ''
  );
  const [expectedDate, setExpectedDate] = useState('2026-11-21');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([
    {
      materialId: firstMaterial?.id ?? '',
      quantity: '1',
      unitCost: firstMaterial ? String(firstMaterial.lastUnitCostKobo / 100) : '',
    },
  ]);
  const [error, setError] = useState('');
  useEscapeClose(onClose);
  const total = useMemo(() => getDraftTotal(lines), [lines]);
  const updateLine = (index: number, patch: Partial<DraftLine>) =>
    setLines((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line))
    );
  const selectMaterial = (index: number, materialId: string) => {
    const material = snapshot.materials.find((item) => item.id === materialId);
    updateLine(index, {
      materialId,
      unitCost: material ? String(material.lastUnitCostKobo / 100) : '',
    });
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const inputLines = lines.map((line) => ({
      materialId: line.materialId,
      quantity: Number(line.quantity),
      unitCostKobo: parseMoney(line.unitCost) ?? -1,
    }));
    try {
      calculateLinesTotal(inputLines);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Check the line items.');
      return;
    }
    const submitError = onSubmit({ supplierId, expectedDate, notes, lines: inputLines });
    if (submitError) setError(submitError);
  };

  return (
    <div
      className="pr-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="pr-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-po-title"
      >
        <div className="pr-dialog-heading">
          <div>
            <p className="sw-eyebrow">Supplier commitment</p>
            <h2 id="create-po-title">New purchase order</h2>
          </div>
          <button
            className="sw-icon-button"
            aria-label="Close new purchase order"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <form className="pr-form" onSubmit={submit}>
          {error && (
            <p className="sw-field-error" role="alert">
              {error}
            </p>
          )}
          <div className="pr-form-grid">
            <label>
              Supplier
              <select
                value={supplierId}
                onChange={(event) => setSupplierId(event.target.value)}
                required
              >
                {snapshot.suppliers.map((supplier) => (
                  <option value={supplier.id} key={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Expected delivery
              <input
                type="date"
                value={expectedDate}
                onChange={(event) => setExpectedDate(event.target.value)}
                required
              />
            </label>
          </div>
          <fieldset className="pr-lines">
            <legend>Medical supplies</legend>
            {lines.map((line, index) => (
              <div className="pr-line" key={index}>
                <label>
                  Supply item
                  <select
                    value={line.materialId}
                    onChange={(event) => selectMaterial(index, event.target.value)}
                  >
                    {snapshot.materials.map((material) => (
                      <option value={material.id} key={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={line.quantity}
                    onChange={(event) => updateLine(index, { quantity: event.target.value })}
                  />
                </label>
                <label>
                  Unit cost (NGN)
                  <input
                    inputMode="decimal"
                    value={line.unitCost}
                    onChange={(event) => updateLine(index, { unitCost: event.target.value })}
                  />
                </label>
                <button
                  type="button"
                  className="sw-icon-button"
                  aria-label={`Remove line ${index + 1}`}
                  disabled={lines.length === 1}
                  onClick={() =>
                    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="sw-quiet"
              onClick={() =>
                setLines((current) => [
                  ...current,
                  {
                    materialId: snapshot.materials[0]?.id ?? '',
                    quantity: '1',
                    unitCost: String((snapshot.materials[0]?.lastUnitCostKobo ?? 0) / 100),
                  },
                ])
              }
            >
              <Plus size={15} /> Add line
            </button>
          </fieldset>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional delivery or quality notes"
            />
          </label>
          <div className="pr-total">
            <span>Purchase order total</span>
            <strong>{total === null ? 'Check line values' : formatMoney(total)}</strong>
          </div>
          <div className="pr-form-actions">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create purchase order</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
