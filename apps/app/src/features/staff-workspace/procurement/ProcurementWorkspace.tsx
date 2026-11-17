import { useStaffActions } from '../policy';
import { commitRecord } from '../journal/store';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from '../StaffShell';
import { StaffHeading } from '../StaffPages';
import { ReceiptForm } from './ReceiptForm';
import { ReceiptRecords, ReceiptDetail } from './ReceiptRecords';
import { ProcurementHome, ProcurementHistory, ProcurementSuppliers } from './ProcurementPages';
import { ProcurementPersonal } from './ProcurementPersonal';
import { createReceipt, loadReceipts, storageKey, draftKey, type ReceiptInput } from './model';
import '../workspace.css';
import './procurement.css';
export function ProcurementWorkspace({
  basePath = '/workspace/procurement',
}: {
  basePath?: string;
}) {
  const permissions = useStaffActions();
  const [snapshot, setSnapshot] = useState(loadReceipts);
  useEffect(() => {
    const refresh = () => setSnapshot(loadReceipts());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const [message, setMessage] = useState('');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = pathname.slice(basePath.length).replace(/\/$/, '');
  function save(input: ReceiptInput): string | null {
    if (!permissions.allowed('procurement:create'))
      return 'Your permissions do not allow receipt entry.';
    const current = loadReceipts();
    if (current.error) return current.error;
    let receipt;
    try {
      receipt = createReceipt(input, current.receipts);
    } catch (error) {
      return error instanceof Error ? error.message : 'Check the receipt fields.';
    }
    const next = [receipt, ...current.receipts];
    try {
      commitRecord(storageKey, JSON.stringify(next));
    } catch {
      return 'Could not save receipt. Your input is still here; allow browser storage and try again.';
    }
    setSnapshot({ receipts: next, error: '' });
    let notice = 'Receipt recorded.';
    try {
      localStorage.removeItem(draftKey);
    } catch {
      notice += ' The old draft could not be cleared; do not submit it again.';
    }
    setMessage(notice);
    navigate(`${basePath}/records/${receipt.id}`);
    return null;
  }
  let content;
  if (snapshot.error)
    content = (
      <>
        <StaffHeading
          title="Saved receipts need attention"
          description="Previous receipt data has been preserved."
        />
        <section className="sw-panel sw-detail">
          <p role="alert" className="sw-field-error">
            {snapshot.error}
          </p>
          <button className="sw-quiet" onClick={() => setSnapshot(loadReceipts())}>
            Retry loading receipts
          </button>
        </section>
      </>
    );
  else if (!page || page === '/tasks')
    content = (
      <ProcurementHome receipts={snapshot.receipts} base={basePath} tasks={page === '/tasks'} />
    );
  else if (page === '/records')
    content = <ReceiptRecords receipts={snapshot.receipts} base={basePath} />;
  else if (page === '/receipts/new') content = <ReceiptForm base={basePath} onSave={save} />;
  else if (/^\/records\/[^/]+$/.test(page))
    content = (
      <ReceiptDetail
        receipt={snapshot.receipts.find((r) => r.id === page.split('/')[2])}
        base={basePath}
      />
    );
  else if (page === '/suppliers') content = <ProcurementSuppliers />;
  else if (page === '/history')
    content = <ProcurementHistory receipts={snapshot.receipts} base={basePath} />;
  else if (page === '/schedule' || page === '/profile')
    content = <ProcurementPersonal page={page.slice(1)} />;
  else
    content = (
      <>
        <StaffHeading
          title="Page not found"
          description="This page is not available in your procurement workspace."
        />
        <Link to={basePath}>Return to overview</Link>
      </>
    );
  return (
    <StaffShell
      base={basePath}
      department="Procurement"
      name="Bisi Afolayan"
      initials="BA"
      role="Procurement officer"
      access={{
        enabledModules: ['procurement'],
        permissions: ['procurement:view', 'records:view', 'history:view', 'schedule:view'],
      }}
      navigationLabels={{ '/workspace/records': 'Material receipts' }}
      extraLinks={[{ path: `${basePath}/suppliers`, label: 'Supplier directory' }]}
    >
      <div className="pc-root">
        {message && (
          <div role="status" className="sw-feedback">
            {message}
            <button
              className="sw-icon-button"
              aria-label="Dismiss message"
              onClick={() => setMessage('')}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {content}
      </div>
    </StaffShell>
  );
}
