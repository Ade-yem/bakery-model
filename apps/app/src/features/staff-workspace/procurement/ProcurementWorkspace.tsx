/** @file Procurement preview feature root and local state controller. */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from '../StaffShell';
import { procurementAccess } from './data';
import {
  addSupplier,
  cancelPurchaseOrder,
  createPurchaseOrder,
  receivePurchaseOrder,
  recordDirectReceipt,
} from './domain';
import { loadProcurementPreview, resetProcurementPreview, saveProcurementPreview } from './storage';
import type {
  CreatePoInput,
  CreateSupplierInput,
  DirectReceiptInput,
  ProcurementSnapshot,
  PurchaseOrder,
  RawMaterial,
  ReceivePoInput,
} from './types';
import { ProcurementOverview } from './ProcurementOverview';
import { PurchaseOrdersPage } from './PurchaseOrdersPage';
import { CreatePoDialog } from './CreatePoDialog';
import { ReceivePoDialog } from './ReceivePoDialog';
import { ReceiptsLedgerPage } from './ReceiptsLedgerPage';
import { RawMaterialStockPage } from './RawMaterialStockPage';
import { SuppliersPage } from './SuppliersPage';
import { AddSupplierDialog } from './AddSupplierDialog';
import '../workspace.css';
import './procurement.css';

type Dialog =
  | { kind: 'create'; material: RawMaterial | null }
  | { kind: 'receive'; purchaseOrder: PurchaseOrder | null }
  | { kind: 'supplier' }
  | null;
const base = '/workspace-preview/procurement';

/** @description Requests explicit confirmation before a recoverable PO cancellation. @param po Target open order. @returns Whether the user confirmed. */
function confirmCancellation(po: PurchaseOrder): boolean {
  return window.confirm(`Cancel ${po.poNumber}? Stock and receipts will not change.`);
}

/**
 * @description Coordinates the client-only procurement preview, keeping each validated state transition durable in localStorage.
 * @returns The five-destination procurement workspace, recoverable storage state, and lifecycle dialogs.
 */
export function ProcurementWorkspace() {
  const [loaded, setLoaded] = useState(loadProcurementPreview);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [message, setMessage] = useState('');
  const { pathname } = useLocation();
  const page = pathname.slice(base.length).replace(/\/$/, '');

  const commit = (
    transition: (snapshot: ProcurementSnapshot) => ProcurementSnapshot,
    success: string
  ): string | null => {
    try {
      const next = transition(loaded.snapshot);
      const storageError = saveProcurementPreview(next);
      if (storageError) return storageError;
      setLoaded({ snapshot: next, error: '' });
      setMessage(success);
      setDialog(null);
      return null;
    } catch (cause) {
      return cause instanceof Error ? cause.message : 'This change could not be completed.';
    }
  };
  const reset = () => {
    const next = resetProcurementPreview();
    setLoaded(next);
    setDialog(null);
    setMessage(next.error || 'Demo data restored to its original state.');
  };
  const cancel = (po: PurchaseOrder) => {
    if (!confirmCancellation(po)) return;
    const error = commit(
      (snapshot) => cancelPurchaseOrder(snapshot, po.id),
      `${po.poNumber} cancelled. No stock movement was created.`
    );
    if (error) setMessage(error);
  };

  let content: React.ReactNode;
  if (loaded.error)
    content = (
      <>
        <header className="sw-page-header">
          <div>
            <p className="sw-eyebrow">Local preview recovery</p>
            <h1>Saved records need attention</h1>
            <p>Your original browser value has been preserved and was not overwritten.</p>
          </div>
        </header>
        <section className="sw-panel pr-recovery">
          <p role="alert" className="sw-field-error">
            {loaded.error}
          </p>
          <div className="pr-header-actions">
            <button className="sw-quiet" onClick={() => setLoaded(loadProcurementPreview())}>
              Retry loading
            </button>
            <button className="pr-cancel" onClick={reset}>
              Reset demo data
            </button>
          </div>
        </section>
      </>
    );
  else if (page === '')
    content = (
      <ProcurementOverview
        snapshot={loaded.snapshot}
        onReorder={(material) => setDialog({ kind: 'create', material })}
        onReset={reset}
      />
    );
  else if (page === '/purchase-orders')
    content = (
      <PurchaseOrdersPage
        snapshot={loaded.snapshot}
        onCreate={() => setDialog({ kind: 'create', material: null })}
        onReceive={(purchaseOrder) => setDialog({ kind: 'receive', purchaseOrder })}
        onDirectReceipt={() => setDialog({ kind: 'receive', purchaseOrder: null })}
        onCancel={cancel}
      />
    );
  else if (page === '/receipts')
    content = (
      <ReceiptsLedgerPage
        receipts={loaded.snapshot.receipts}
        movements={loaded.snapshot.movements}
        suppliers={loaded.snapshot.suppliers}
        onRecordDirectReceipt={() => setDialog({ kind: 'receive', purchaseOrder: null })}
      />
    );
  else if (page === '/stock')
    content = (
      <RawMaterialStockPage
        materials={loaded.snapshot.materials}
        suppliers={loaded.snapshot.suppliers}
        onReorder={(material) => setDialog({ kind: 'create', material })}
      />
    );
  else if (page === '/suppliers')
    content = (
      <SuppliersPage
        suppliers={loaded.snapshot.suppliers}
        onOpenAddSupplier={() => setDialog({ kind: 'supplier' })}
      />
    );
  else
    content = (
      <>
        <PreviewPlaceholder
          eyebrow="Procurement workspace"
          title="Page not found"
          description="This page is not available in the Procurement preview."
        />
        <Link className="sw-quiet" to={base}>
          Return to overview
        </Link>
      </>
    );

  const modal =
    dialog?.kind === 'create' ? (
      <CreatePoDialog
        snapshot={loaded.snapshot}
        prefilledMaterial={dialog.material}
        onClose={() => setDialog(null)}
        onSubmit={(input: CreatePoInput) =>
          commit(
            (snapshot) => createPurchaseOrder(snapshot, input),
            'Purchase order created and saved locally.'
          )
        }
      />
    ) : dialog?.kind === 'receive' ? (
      <ReceivePoDialog
        snapshot={loaded.snapshot}
        purchaseOrder={dialog.purchaseOrder}
        onClose={() => setDialog(null)}
        onReceivePo={(input: ReceivePoInput) =>
          commit(
            (snapshot) => receivePurchaseOrder(snapshot, input),
            'Receipt posted. Stock and the inbound ledger were updated atomically.'
          )
        }
        onDirectReceipt={(input: DirectReceiptInput) =>
          commit(
            (snapshot) => recordDirectReceipt(snapshot, input),
            'Direct receipt posted. Stock and the inbound ledger were updated atomically.'
          )
        }
      />
    ) : dialog?.kind === 'supplier' ? (
      <AddSupplierDialog
        onClose={() => setDialog(null)}
        onSave={(input: CreateSupplierInput) =>
          commit(
            (snapshot) => addSupplier(snapshot, input),
            'Supplier added and available for new orders.'
          )
        }
      />
    ) : null;
  return (
    <StaffShell
      base={base}
      department="Procurement"
      name="Kemi Adeyemi"
      initials="KA"
      role="Procurement Officer"
      access={procurementAccess}
      hiddenNavigationPaths={['/workspace/profile']}
      navigationLabels={{
        '/workspace/tasks': 'Purchase Orders',
        '/workspace/records': 'Receipts & Ledger',
      }}
      navigationPathOverrides={{
        '/workspace/tasks': `${base}/purchase-orders`,
        '/workspace/records': `${base}/receipts`,
      }}
      extraLinks={[
        { path: `${base}/stock`, label: 'Raw Material Stock' },
        { path: `${base}/suppliers`, label: 'Suppliers' },
      ]}
      showSyncStatus={false}
      dialog={modal}
    >
      <WorkspaceFeedback message={message} onDismiss={() => setMessage('')} />
      {content}
    </StaffShell>
  );
}

/** @description Renders recovery copy for an unknown procurement route. @param props Page copy. @returns A scoped fallback heading. */
function PreviewPlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="sw-page-header">
      <div>
        <p className="sw-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}

/** @description Announces persisted workspace changes and provides a dismiss action. @param props Feedback text and dismiss callback. @returns A live status region or null. */
function WorkspaceFeedback({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return message ? (
    <div role="status" className="sw-feedback">
      {message}
      <button className="sw-icon-button" aria-label="Dismiss message" onClick={onDismiss}>
        <X size={16} />
      </button>
    </div>
  ) : null;
}
