import { useStaffActions } from '../policy';
import { commitRecord } from '../journal/store';
import { HandoverPage } from '../handover/HandoverPage';
import { balances, products, type Product } from './model';
import { DisbursementStock } from './DisbursementStock';
import { DisbursementPersonal } from './DisbursementPersonal';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from '../StaffShell';
import { StaffHeading } from '../StaffPages';
import { DisbursementRecords } from './DisbursementRecords';
import { DisbursementDetail } from './DisbursementDetail';
import { DisbursementHome, DisbursementHistory } from './DisbursementPages';
import { applyAction, loadState, storageKey, type Action } from './model';
import '../workspace.css';
import './disbursement.css';

/** Disbursement pages. Quantity validation is local; authoritative posting requires the API. */
export function DisbursementWorkspace({
  basePath = '/workspace/disbursement',
}: {
  basePath?: string;
}) {
  const permissions = useStaffActions();
  const [snapshot, setSnapshot] = useState(loadState);
  useEffect(() => {
    const refresh = () => setSnapshot(loadState());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const [message, setMessage] = useState('');
  const { pathname } = useLocation();
  const page = pathname.slice(basePath.length).replace(/\/$/, '');
  function save(action: Action): string | null {
    if (snapshot.error) return snapshot.error;
    if (
      !permissions.allowed(
        action.kind === 'accept'
          ? 'transfer:accept'
          : action.kind === 'fulfill'
            ? 'orders:fulfill'
            : 'stock:count'
      )
    )
      return 'Your permissions do not allow this stock action.';
    try {
      // Reload before appending so another tab's completed action cannot be silently overwritten.
      const current = loadState();
      if (current.error) return current.error;
      const next = applyAction(current.state, action);
      commitRecord(storageKey, JSON.stringify(next));
      setSnapshot({ state: next, error: '' });
      setMessage('Record saved.');
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'Could not save this record. Your input has been retained.';
    }
  }
  let content;
  if (snapshot.error)
    content = (
      <>
        <StaffHeading
          title="Saved records need attention"
          description="Previous records have been preserved."
        />
        <section className="sw-panel sw-detail">
          <p role="alert" className="sw-field-error">
            {snapshot.error}
          </p>
          <button className="sw-quiet" onClick={() => setSnapshot(loadState())}>
            Retry loading records
          </button>
        </section>
      </>
    );
  else if (!page) content = <DisbursementHome state={snapshot.state} base={basePath} />;
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
        currentLines={() => {
          const current = loadState();
          if (current.error) throw new Error(current.error);
          return (Object.keys(products) as Product[]).map((id) => ({
            id,
            label: products[id],
            expected: balances(current.state)[id],
            scale: 1,
          }));
        }}
        department="disbursement"
        actor="disbursement@demo.tallybakery.test"
        lines={(Object.keys(products) as Product[]).map((id) => ({
          id,
          label: products[id],
          expected: balances(snapshot.state)[id],
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
      name="Chidi Nwosu"
      initials="CN"
      role="Disbursement officer"
      access={{
        enabledModules: ['disbursement'],
        permissions: ['disbursement:view', 'records:view', 'history:view', 'schedule:view'],
      }}
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
