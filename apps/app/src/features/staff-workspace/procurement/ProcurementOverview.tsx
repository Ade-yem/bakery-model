/** @file Executive procurement overview with state-derived operational signals. */
import { AlertTriangle, ClipboardList, PackageCheck, ReceiptText, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { deriveProcurementKpis, formatMoney, getStockStatus } from './domain';
import type { ProcurementSnapshot, RawMaterial } from './types';

interface Props {
  snapshot: ProcurementSnapshot;
  onReorder: (material: RawMaterial) => void;
  branchName?: string;
  onReset?: () => void;
}

/**
 * @description Gives procurement managers a concise view of commitments, spend, receipts, and materials needing action.
 * @param props Current snapshot and callbacks for overview actions.
 * @returns A state-derived overview with low-stock quick reorder and recent receipt context.
 */
export function ProcurementOverview({ snapshot, onReorder, branchName, onReset }: Props) {
  const kpis = deriveProcurementKpis(snapshot);
  const lowStock = snapshot.materials.filter(
    (material) => getStockStatus(material.currentStock, material.minThreshold) !== 'OK'
  );
  const supplierNames = new Map(snapshot.suppliers.map((supplier) => [supplier.id, supplier.name]));
  const cards = [
    { label: 'Open purchase orders', value: String(kpis.openPoCount), Icon: ClipboardList },
    {
      label: "Today's procurement spend",
      value: formatMoney(kpis.todaySpendKobo),
      Icon: ReceiptText,
    },
    { label: 'Low-stock alerts', value: String(kpis.lowStockCount), Icon: AlertTriangle },
    { label: 'Posted receipts', value: String(kpis.postedReceiptsCount), Icon: PackageCheck },
  ];

  return (
    <>
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">{branchName ? `${branchName} · ` : ''}Procurement control</p>
          <h1>Procurement overview</h1>
          <p>Monitor vendor commitments, medical spend, and critical ward supply risk in one place.</p>
        </div>
        {onReset && (
          <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={onReset}>
            Reset demo data
          </Button>
        )}
      </header>

      <section className="sw-stats pr-stats" aria-label="Procurement summary">
        {cards.map(({ label, value, Icon }) => (
          <div key={label}>
            <div className="sw-stat-title">
              <span>{label}</span>
              <span className="pr-stat-icon">
                <Icon size={16} />
              </span>
            </div>
            <strong
              className={
                label.includes('spend') ? 'sw-stat-value pr-money pr-money-stat' : 'sw-stat-value'
              }
            >
              {value}
            </strong>
            <p>Derived from recorded movements</p>
          </div>
        ))}
      </section>

      <div className="pr-overview-grid">
        <section className="sw-panel">
          <div className="sw-panel-heading pr-panel-head">
            <div>
              <p className="sw-eyebrow">Action needed</p>
              <h2>Low-stock alerts</h2>
            </div>
            <span className="pr-count">{lowStock.length} materials</span>
          </div>
          <div className="pr-alert-list">
            {lowStock.map((material) => {
              const status = getStockStatus(material.currentStock, material.minThreshold);
              return (
                <article className="pr-alert-row" key={material.id}>
                  <div>
                    <span className={`sw-state pr-status-pill pr-${status.toLowerCase()}`}>
                      {status}
                    </span>
                    <h3>{material.name}</h3>
                    <p>
                      {material.currentStock} {material.unit} available · threshold{' '}
                      {material.minThreshold}
                    </p>
                  </div>
                  <Button size="sm" variant="copper" onClick={() => onReorder(material)}>
                    Reorder
                  </Button>
                </article>
              );
            })}
            {lowStock.length === 0 && (
              <div className="sw-empty">
                <h3>All supply levels healthy</h3>
                <p>Every tracked medical supply item is above its minimum reorder threshold.</p>
              </div>
            )}
          </div>
        </section>

        <section className="sw-panel">
          <div className="sw-panel-heading pr-panel-head">
            <div>
              <p className="sw-eyebrow">Append-only ledger</p>
              <h2>Recent receipts</h2>
            </div>
            <span className="pr-count">{snapshot.receipts.length} posted</span>
          </div>
          <div className="pr-receipt-list">
            {snapshot.receipts.slice(0, 4).map((receipt) => (
              <article key={receipt.id}>
                <div>
                  <strong>{receipt.reference}</strong>
                  <p>{supplierNames.get(receipt.supplierId)}</p>
                </div>
                <div className="pr-align-right">
                  <strong className="pr-money">{formatMoney(receipt.totalAmountKobo)}</strong>
                  <p>{new Date(receipt.receivedAt).toLocaleDateString('en-NG')}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
