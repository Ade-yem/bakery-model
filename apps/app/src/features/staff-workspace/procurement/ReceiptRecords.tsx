import { Allowed } from '../Allowed';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight } from 'lucide-react';
import { StaffHeading } from '../StaffPages';
import { suppliers, materials, formatMoney, receiptTotal, type Receipt } from './model';
export function ReceiptRecords({ receipts, base }: { receipts: Receipt[]; base: string }) {
  const [query, setQuery] = useState('');
  const [supplier, setSupplier] = useState('all');
  const rows = receipts.filter(
    (r) =>
      (supplier === 'all' || r.supplierId === supplier) &&
      `${r.id} ${r.reference} ${materials.find((m) => m.id === r.materialId)?.name}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  return (
    <>
      <StaffHeading
        title="Material receipts"
        description="Received materials and supplier invoice references"
      />
      <div className="pc-actions">
        <label className="sw-search">
          <Search size={16} />
          <input
            aria-label="Search receipts"
            placeholder="Search receipt, invoice or material"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="pc-filter">
          Supplier
          <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
            <option value="all">All suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <Allowed action="procurement:create">
          <Link className="sw-primary" to={`${base}/receipts/new`}>
            Record receipt
          </Link>
        </Allowed>
      </div>
      <section className="sw-panel">
        <div className="sw-table-scroll">
          <table className="sw-table">
            <thead>
              <tr>
                <th>Receipt / invoice</th>
                <th>Supplier</th>
                <th>Material / quantity</th>
                <th>Total</th>
                <th>Received</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.id}</strong>
                    <span>{r.reference}</span>
                  </td>
                  <td>{suppliers.find((s) => s.id === r.supplierId)?.name}</td>
                  <td>
                    <strong>
                      {r.additionalLines?.length
                        ? `${r.additionalLines.length + 1} material lines`
                        : materials.find((m) => m.id === r.materialId)?.name}
                    </strong>
                    <span>
                      {r.quantity} {materials.find((m) => m.id === r.materialId)?.unit}
                    </span>
                  </td>
                  <td>{formatMoney(r.total)}</td>
                  <td>{r.receivedOn}</td>
                  <td>
                    <Link
                      aria-label={`View ${r.id}`}
                      className="sw-inline"
                      to={`${base}/records/${r.id}`}
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="sw-empty">
            <h2>No matching receipts</h2>
            <p>Try another reference, material or supplier filter.</p>
          </div>
        )}
        <div className="sw-panel-footer">
          No live inventory changes. Corrections to posted operational receipts require linked
          reversal entries.
        </div>
      </section>
    </>
  );
}
export function ReceiptDetail({ receipt, base }: { receipt?: Receipt; base: string }) {
  if (!receipt)
    return (
      <>
        <StaffHeading
          title="Receipt not found"
          description="This receipt is not available in your workspace."
        />
        <Link to={`${base}/records`}>Back to receipts</Link>
      </>
    );
  const material = materials.find((m) => m.id === receipt.materialId)!;
  return (
    <>
      <StaffHeading title={receipt.id} description="Received-material evidence · Read-only" />
      <Link className="sw-quiet" to={`${base}/records`}>
        Back to receipts
      </Link>
      <section className="sw-panel sw-detail pc-detail">
        <h2>
          {receipt.additionalLines?.length
            ? `Material receipt · ${receipt.additionalLines.length + 1} lines`
            : material.name}
        </h2>
        {receipt.additionalLines?.length ? (
          <div className="sw-table-scroll">
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantity / unit</th>
                  <th>Unit cost</th>
                  <th>Line total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    materialId: receipt.materialId,
                    quantity: receipt.quantity,
                    unitCost: receipt.unitCost,
                  },
                  ...receipt.additionalLines,
                ].map((line, index) => (
                  <tr key={index}>
                    <td>{materials.find((m) => m.id === line.materialId)?.name}</td>
                    <td>
                      {line.quantity} {materials.find((m) => m.id === line.materialId)?.unit}
                    </td>
                    <td>{formatMoney(receiptTotal('1', line.unitCost))}</td>
                    <td>{formatMoney(receiptTotal(line.quantity, line.unitCost))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <dl>
          {[
            ['Supplier', suppliers.find((s) => s.id === receipt.supplierId)!.name],
            ['Invoice / delivery reference', receipt.reference],
            ['Received', receipt.receivedOn],
            [
              receipt.additionalLines?.length ? 'First-line quantity' : 'Quantity',
              `${receipt.quantity} ${material.unit}`,
            ],
            [
              receipt.additionalLines?.length ? 'First-line unit cost' : 'Unit cost',
              formatMoney(receiptTotal('1', receipt.unitCost)),
            ],
            ['Total', formatMoney(receipt.total)],
            ['Receiver', 'Bisi Afolayan'],
            [
              'Recorded',
              new Date(receipt.recordedAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) +
                ' WAT',
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {receipt.note && <p className="sw-callout">{receipt.note}</p>}
        <p className="sw-muted">
          Received evidence is read-only. Corrections must link back to the original receipt.
        </p>
      </section>
    </>
  );
}
