import { useStaffActions } from '../policy';
import { useDepartmentData, useWorkspace } from '../../integration/workspace';
import { useAuth } from '../../integration/auth';
import { HandoverPage } from '../handover/HandoverPage';
import { balances, type Product } from './model';
import { DisbursementStock } from './DisbursementStock';
import { DisbursementPersonal } from './DisbursementPersonal';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from '../StaffShell';
import { StaffHeading } from '../StaffPages';
import { DisbursementRecords } from './DisbursementRecords';
import { DisbursementDetail } from './DisbursementDetail';
import { DisbursementHome, DisbursementHistory } from './DisbursementPages';
import { applyAction, type Action } from './model';
import '../workspace.css';
import './disbursement.css';

/** Disbursement pages. Quantity validation is local; authoritative posting requires the API. */
export function DisbursementWorkspace({
  basePath = '/workspace/disbursement',
}: {
  basePath?: string;
}) {
  const permissions = useStaffActions();
  const data = useDepartmentData('disbursement');
  const workspace = useWorkspace();
  const { session } = useAuth();
  const products = data.products;
  const snapshot = { state: data.state };
  const [message, setMessage] = useState('');
  const { pathname } = useLocation();
  const page = pathname.slice(basePath.length).replace(/\/$/, '');
  async function save(action: Action): Promise<string | null> {
    try {
      const type =
        action.kind === 'accept'
          ? 'transfer:accept'
          : action.kind === 'fulfill'
            ? 'orders:fulfill'
            : 'stock:count';
      permissions.require(type);
      applyAction(data.state, action, data);
      await workspace.submit({ type, action });
      setMessage('Stock action recorded. Review its current status in records.');
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'Could not save this action. Your input is retained.';
    }
  }
  let content;
  if (!page) content = <DisbursementHome state={snapshot.state} base={basePath} />;
  else if (page === '/tasks' || page === '/records')
    content = (
      <>
        <StaffHeading
          title={page === '/tasks' ? 'Department tasks' : 'Department records'}
          description="Incoming transfers and pushed orders"
        />
        <DisbursementRecords
          state={snapshot.state}
          base={basePath}
          pendingOnly={page === '/tasks'}
        />
      </>
    );
  else if (/^\/records\/[^/]+$/.test(page))
    content = (
      <DisbursementDetail
        key={page}
        id={page.split('/')[2]}
        state={snapshot.state}
        base={basePath}
        onSave={save}
      />
    );
  else if (page === '/handover')
    content = (
      <HandoverPage
        department="disbursement"
        actor={session!.userId}
        lines={(Object.keys(products) as Product[]).map((id) => ({
          id,
          label: products[id],
          expected: balances(snapshot.state, data.opening)[id],
          scale: 1,
        }))}
      />
    );
  else if (page === '/stock') content = <DisbursementStock state={snapshot.state} onSave={save} />;
  else if (page === '/history')
    content = <DisbursementHistory state={snapshot.state} base={basePath} />;
  else if (page === '/schedule' || page === '/profile')
    content = <DisbursementPersonal page={page.slice(1)} />;
  else
    content = (
      <>
        <StaffHeading
          title="Page not found"
          description="This page is not available in your department workspace."
        />
        <Link className="sw-quiet" to={basePath}>
          Return to overview
        </Link>
      </>
    );
  return (
    <StaffShell
      base={basePath}
      department="Disbursement"
      extraLinks={[
        { path: `${basePath}/stock`, label: 'Stock & closing counts' },
        { path: `${basePath}/handover`, label: 'Closing & handover' },
      ]}
    >
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
    </StaffShell>
  );
}
