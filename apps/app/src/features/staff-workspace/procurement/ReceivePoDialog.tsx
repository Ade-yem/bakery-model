/** @file Accessible PO-linked and direct procurement receipt dialog. */
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { parseMoney } from './domain';
import type {
  DirectReceiptInput,
  ProcurementSnapshot,
  PurchaseOrder,
  ReceivePoInput,
} from './types';

interface Props {
  snapshot: ProcurementSnapshot;
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
  onReceivePo: (input: ReceivePoInput) => string | null;
  onDirectReceipt: (input: DirectReceiptInput) => string | null;
}

/** @description Closes the active overlay from the standard Escape key. @param onClose Overlay close callback. @returns Nothing. */
function useEscapeClose(onClose: () => void): void {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);
}

/** @description Validates direct-receipt form strings without floating-point currency math. @param quantity Whole-unit text. @param unitCost NGN text. @returns A domain line fragment, or null. */
function parseDirectLine(quantity: string, unitCost: string) {
  const parsedQuantity = Number(quantity);
  const parsedUnitCost = parseMoney(unitCost);
  if (!Number.isSafeInteger(parsedQuantity) || parsedQuantity <= 0 || parsedUnitCost === null) {
    return null;
  }
  return { quantity: parsedQuantity, unitCostKobo: parsedUnitCost };
}

/**
 * @description Confirms delivered quantities and an external reference before the workspace applies one atomic receipt transition.
 * @param props Current procurement data, optional linked PO, and mutation callbacks.
 * @returns A modal delivery form for either linked or direct supplier receipts.
 */
export function ReceivePoDialog({
  snapshot,
  purchaseOrder,
  onClose,
  onReceivePo,
  onDirectReceipt,
}: Props) {
  const direct = purchaseOrder === null;
  const initialMaterial = snapshot.materials[0];
  const [supplierId, setSupplierId] = useState(
    purchaseOrder?.supplierId ?? snapshot.suppliers[0]?.id ?? ''
  );
  const [materialId, setMaterialId] = useState(initialMaterial?.id ?? '');
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState(String((initialMaterial?.lastUnitCostKobo ?? 0) / 100));
  const [reference, setReference] = useState('');
  const [receivedBy, setReceivedBy] = useState('Kemi Adeyemi');
  const [notes, setNotes] = useState('');
  const [poQuantities, setPoQuantities] = useState<Record<string, string>>(
    Object.fromEntries(
      purchaseOrder?.lines.map((line) => [line.materialId, String(line.quantity)]) ?? []
    )
  );
  const [error, setError] = useState('');
  useEscapeClose(onClose);
  const changeDirectMaterial = (nextId: string) => {
    const material = snapshot.materials.find((item) => item.id === nextId);
    setMaterialId(nextId);
    setUnitCost(String((material?.lastUnitCostKobo ?? 0) / 100));
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!reference.trim()) {
      setError('Supplier invoice or delivery reference is required.');
      return;
    }
    let submitError: string | null;
    if (purchaseOrder) {
      const lines = purchaseOrder.lines.map((line) => ({
        materialId: line.materialId,
        quantity: Number(poQuantities[line.materialId]),
      }));
      if (lines.some((line) => !Number.isSafeInteger(line.quantity) || line.quantity <= 0)) {
        setError('Received quantities must be positive whole numbers.');
        return;
      }
      submitError = onReceivePo({ poId: purchaseOrder.id, reference, receivedBy, notes, lines });
    } else {
      const line = parseDirectLine(quantity, unitCost);
      if (!line) {
        setError('Quantity must be a positive whole number and unit cost must be nonnegative.');
        return;
      }
      submitError = onDirectReceipt({
        supplierId,
        reference,
        receivedBy,
        notes,
        lines: [{ materialId, ...line }],
      });
    }
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
        className="pr-dialog pr-dialog-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receive-title"
      >
        <div className="pr-dialog-heading">
          <div>
            <p className="sw-eyebrow">Atomic stock posting</p>
            <h2 id="receive-title">
              {direct ? 'Record direct receipt' : `Receive ${purchaseOrder.poNumber}`}
            </h2>
          </div>
          <button className="sw-icon-button" aria-label="Close receipt dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form className="pr-form" onSubmit={submit}>
          <FormError message={error} />
          {direct && (
            <>
              <label>
                Supplier
                <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
                  {snapshot.suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="pr-form-grid">
                <label>
                  Supply item
                  <select
                    value={materialId}
                    onChange={(event) => changeDirectMaterial(event.target.value)}
                  >
                    {snapshot.materials.map((material) => (
                      <option key={material.id} value={material.id}>
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
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </label>
              </div>
              <label>
                Unit cost (NGN)
                <input
                  inputMode="decimal"
                  value={unitCost}
                  onChange={(event) => setUnitCost(event.target.value)}
                />
              </label>
            </>
          )}
          {purchaseOrder && (
            <fieldset className="pr-lines">
              <legend>Received quantities</legend>
              {purchaseOrder.lines.map((line) => (
                <label key={line.materialId}>
                  {line.materialName}
                  <span>{line.unit}</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={poQuantities[line.materialId]}
                    onChange={(event) =>
                      setPoQuantities((current) => ({
                        ...current,
                        [line.materialId]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </fieldset>
          )}
          <div className="pr-form-grid">
            <label>
              Invoice / delivery reference
              <input
                autoFocus
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="e.g. INV-9981"
              />
            </label>
            <label>
              Received by
              <input value={receivedBy} onChange={(event) => setReceivedBy(event.target.value)} />
            </label>
          </div>
          <label>
            Receipt notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional batch, expiry, or cold-chain condition notes"
            />
          </label>
          <p className="pr-atomic-note">
            Posting will append a receipt and inbound movement, then update stock
            {purchaseOrder ? ' and mark this PO received' : ''}.
          </p>
          <div className="pr-form-actions">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Post receipt</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

/** @description Announces receipt validation feedback without reserving empty space. @param props Current message. @returns An alert or null. */
function FormError({ message }: { message: string }) {
  return message ? (
    <p className="sw-field-error" role="alert">
      {message}
    </p>
  ) : null;
}
