/** @file Purchase Order list, status filtering, and lifecycle actions. */
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { formatMoney } from './domain';
import type { ProcurementSnapshot, PurchaseOrder, PurchaseOrderStatus } from './types';

type Filter = 'ALL' | PurchaseOrderStatus;
interface Props {
  snapshot: ProcurementSnapshot;
  onCreate: () => void;
  onReceive: (purchaseOrder: PurchaseOrder) => void;
  onDirectReceipt: () => void;
  onCancel: (purchaseOrder: PurchaseOrder) => void;
}

/**
 * @description Presents supplier commitments with explicit filters and guards lifecycle actions to OPEN orders.
 * @param props Procurement data and callbacks owned by the workspace state controller.
 * @returns Filterable Purchase Order table with creation, receipt, and cancellation controls.
 */
export function PurchaseOrdersPage({
  snapshot,
  onCreate,
  onReceive,
  onDirectReceipt,
  onCancel,
}: Props) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const supplierNames = new Map(snapshot.suppliers.map((supplier) => [supplier.id, supplier.name]));
  const orders = snapshot.purchaseOrders.filter(
    (order) => filter === 'ALL' || order.status === filter
  );

  return (
    <>
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">Supplier commitments</p>
          <h1>Purchase orders</h1>
          <p>Create, receive, or cancel orders while preserving their history.</p>
        </div>
        <div className="pr-header-actions">
          <Button variant="secondary" onClick={onDirectReceipt}>
            Direct receipt
          </Button>
          <Button icon={<Plus size={16} />} onClick={onCreate}>
            New purchase order
          </Button>
        </div>
      </header>
      <section className="sw-panel pr-panel">
        <div className="pr-toolbar">
          <div className="pr-filter-tabs" role="group" aria-label="Filter by order status">
            {(['ALL', 'OPEN', 'RECEIVED', 'CANCELLED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={`pr-filter-tab ${filter === status ? 'is-active' : ''}`}
                aria-pressed={filter === status}
                onClick={() => setFilter(status)}
              >
                {status === 'ALL' ? 'All orders' : status}
              </button>
            ))}
          </div>
          <span className="pr-count">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
        <div className="sw-table-scroll">
          <table className="sw-table pr-table">
            <thead>
              <tr>
                <th>PO</th>
                <th>Supplier</th>
                <th>Expected</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>
                  <span className="pr-sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.poNumber}</strong>
                    <small>{new Date(order.createdAt).toLocaleDateString('en-NG')}</small>
                  </td>
                  <td>{supplierNames.get(order.supplierId) ?? 'Unknown supplier'}</td>
                  <td>{new Date(`${order.expectedDate}T00:00:00`).toLocaleDateString('en-NG')}</td>
                  <td>
                    {order.lines.length} ·{' '}
                    {order.lines.reduce((sum, line) => sum + line.quantity, 0)} units
                  </td>
                  <td className="pr-money">{formatMoney(order.totalAmountKobo)}</td>
                  <td>
                    <span className={`sw-state pr-status-pill pr-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="pr-row-actions">
                      <button
                        type="button"
                        className="sw-quiet"
                        disabled={order.status !== 'OPEN'}
                        onClick={() => onReceive(order)}
                      >
                        Receive delivery
                      </button>
                      <button
                        type="button"
                        className="pr-cancel"
                        disabled={order.status !== 'OPEN'}
                        onClick={() => onCancel(order)}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders.length && (
          <div className="sw-empty">
            <h3>No purchase orders</h3>
            <p>No purchase orders match the selected status filter.</p>
          </div>
        )}
      </section>
    </>
  );
}
