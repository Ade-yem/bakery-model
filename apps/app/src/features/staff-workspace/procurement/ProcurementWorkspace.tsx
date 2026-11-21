import { useStaffActions } from '../policy';
import { useDepartmentData, useWorkspace, useDraftKey } from '../../integration/workspace';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from '../StaffShell';
import { StaffHeading } from '../StaffPages';
import { ReceiptForm } from './ReceiptForm';
import { ReceiptRecords, ReceiptDetail } from './ReceiptRecords';
import { ProcurementHome, ProcurementHistory, ProcurementSuppliers } from './ProcurementPages';
import { ProcurementPersonal } from './ProcurementPersonal';
import { createReceipt, type ReceiptInput } from './model';
import '../workspace.css';
import './procurement.css';
export function ProcurementWorkspace({
  basePath = '/workspace/procurement',
}: {
  basePath?: string;
}) {
  const permissions = useStaffActions();
  const data = useDepartmentData('procurement');
  const workspace = useWorkspace();
  const draftKey = useDraftKey('procurement');
  const snapshot = { receipts: data.receipts };
  const [message, setMessage] = useState('');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = pathname.slice(basePath.length).replace(/\/$/, '');
  async function save(input: ReceiptInput): Promise<string | null> {
    try {
      permissions.require('procurement:create');
      const receipt = createReceipt(input, data.receipts, data);
      await workspace.submit({ type: 'procurement:create', receipt: input });
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* The recorded submission remains available. */
      }
      setMessage('Receipt submission recorded. Review its current status in records.');
      navigate(`${basePath}/records/${receipt.id}`);
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'Could not save receipt. Your input is retained.';
    }
  }
  let content;
  if (!page || page === '/tasks')
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
