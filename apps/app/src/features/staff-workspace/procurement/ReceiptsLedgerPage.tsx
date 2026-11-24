/** @file Append-only Procurement Receipts & Inbound Stock Movement ledger view. */
import { useState } from 'react';
import { ChevronDown, ChevronUp, FileCheck2, Search } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { formatMoney } from './domain';
import type { ProcurementReceipt, StockMovement, Supplier } from './types';

interface Props {
  receipts: readonly ProcurementReceipt[];
  movements: readonly StockMovement[];
  suppliers: readonly Supplier[];
  onRecordDirectReceipt: () => void;
}

/**
 * @description Displays immutable procurement receipts and their linked inbound stock movements.
 * @param props Posted receipts, stock movements, suppliers, and direct receipt callback.
 * @returns Searchable ledger table with expandable line-item and movement breakdowns.
 */
export function ReceiptsLedgerPage({
  receipts,
  movements,
  suppliers,
  onRecordDirectReceipt,
}: Props) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supplierById = new Map(suppliers.map((s) => [s.id, s.name]));

  const filtered = receipts.filter((receipt) => {
    const supplierName = supplierById.get(receipt.supplierId) ?? '';
    return `${receipt.receiptNumber} ${receipt.reference} ${supplierName} ${receipt.receivedBy}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  });

  return (
    <section aria-labelledby="receipts-heading">
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">Append-only ledger</p>
          <h1 id="receipts-heading">Receipts &amp; Ledger</h1>
          <p>
            Posted supplier deliveries are immutable and automatically linked to inbound stock movements.
          </p>
        </div>
        <Button icon={<FileCheck2 size={16} />} onClick={onRecordDirectReceipt}>
          Direct receipt
        </Button>
      </header>

      <div className="sw-panel pr-panel">
        <div className="pr-toolbar">
          <label className="sw-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search receipt, invoice ref, or supplier"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="pr-count">
            {filtered.length} {filtered.length === 1 ? 'posted receipt' : 'posted receipts'}
          </span>
        </div>

        <div className="sw-table-scroll">
          <table className="sw-table pr-table">
            <thead>
              <tr>
                <th scope="col">Receipt / Reference</th>
                <th scope="col">Supplier</th>
                <th scope="col">Received by</th>
                <th scope="col">Total</th>
                <th scope="col">Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((receipt) => {
                const isExpanded = expandedId === receipt.id;
                const linkedMovements = movements.filter((m) => m.receiptId === receipt.id);
                return (
                  <tr key={receipt.id}>
                    <td>
                      <strong>{receipt.receiptNumber}</strong>
                      <span>
                        Ref: {receipt.reference}
                        {receipt.poId ? ` · ${receipt.poId}` : ' · Direct'}
                      </span>
                    </td>
                    <td>{supplierById.get(receipt.supplierId) ?? receipt.supplierId}</td>
                    <td>
                      <strong>{receipt.receivedBy}</strong>
                      <span>{new Date(receipt.receivedAt).toLocaleString()}</span>
                    </td>
                    <td className="pr-money">{formatMoney(receipt.totalAmountKobo)}</td>
                    <td>
                      <button
                        type="button"
                        className="sw-quiet"
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedId(isExpanded ? null : receipt.id)}
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        {receipt.lines.length} {receipt.lines.length === 1 ? 'line' : 'lines'}
                      </button>
                      {isExpanded && (
                        <div className="pr-ledger-detail">
                          <ul>
                            {receipt.lines.map((line) => (
                              <li key={`${receipt.id}-${line.materialId}`}>
                                {line.materialName}: +{line.quantity} {line.unit} @{' '}
                                {formatMoney(line.unitCostKobo)}
                              </li>
                            ))}
                          </ul>
                          <p className="sw-muted">
                            Movements: {linkedMovements.map((m) => m.id).join(', ') || 'None'}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="sw-empty">
              <h3>No matching receipts</h3>
              <p>Try a different receipt number, invoice reference, or supplier name.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
