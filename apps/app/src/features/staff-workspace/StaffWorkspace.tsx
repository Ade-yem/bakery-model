import { useStaffActions } from './policy';
import { useDepartmentData, useWorkspace, useDraftKey } from '../integration/workspace';
/** @file Production staff pages; the router owns session enforcement. */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from './StaffShell';
import { StaffHome } from './StaffHome';
import {
  StaffHeading,
  StaffTasks,
  StaffRecords,
  StaffRecordDetail,
  StaffHistory,
  StaffSchedule,
  StaffProfile,
} from './StaffPages';
import { BatchDraftDialog } from './BatchDraftDialog';
import './workspace.css';
interface Props {
  basePath?: string;
}
/**
 * @description Renders the Production workspace behind the shared staff route boundary.
 * @param props Canonical route base for Production pages.
 * @returns Responsive Production staff pages.
 */
export function StaffWorkspace({ basePath }: Props) {
  const permissions = useStaffActions();
  const data = useDepartmentData('production');
  const workspace = useWorkspace();
  const draftKey = useDraftKey('production');
  const location = useLocation();
  const [batchId, setBatchId] = useState('');
  const [batchOpen, setBatchOpen] = useState(false);
  const [message, setMessage] = useState('');
  const base = basePath ?? '/workspace/production';
  const page = location.pathname.slice(base.length).replace(/\/$/, '');
  const openBatch = () => {
    if (!permissions.allowed('production:create')) {
      setMessage('Your permissions do not allow batch entry.');
      return;
    }
    setBatchId(`BAT-${crypto.randomUUID()}`);
    setBatchOpen(true);
  };
  let content;
  if (page === '') content = <StaffHome base={base} onBatch={openBatch} />;
  else if (page === '/tasks') content = <StaffTasks base={base} onBatch={openBatch} />;
  else if (page === '/records') content = <StaffRecords base={base} />;
  else if (/^\/records\/[^/]+$/.test(page))
    content = <StaffRecordDetail base={base} recordId={page.split('/')[2]} />;
  else if (page === '/history') content = <StaffHistory />;
  else if (page === '/schedule') content = <StaffSchedule />;
  else if (page === '/profile') content = <StaffProfile />;
  else
    content = (
      <>
        <StaffHeading
          title="Page not found"
          description="This page is not part of your staff workspace."
        />
        <Link className="sw-quiet" to={base}>
          Return to overview
        </Link>
      </>
    );
  return (
    <StaffShell
      base={base}
      department="Production"

      dialog={
        batchOpen ? (
          <BatchDraftDialog
            onSubmitBatch={async (values) => {
              try {
                permissions.require('production:create');
                if (!data.products.includes(values.product ?? ''))
                  return 'Choose a listed product.';
                await workspace.submit({ type: 'production:create', id: batchId, values });
                try {
                  localStorage.removeItem(draftKey);
                } catch {
                  /* The recorded submission remains available. */
                }
                setBatchOpen(false);
                setMessage(
                  'Batch submission recorded. Review its receiving and synchronization status in records.'
                );
                return null;
              } catch (error) {
                return error instanceof Error
                  ? error.message
                  : 'Batch could not be saved. Your input is retained.';
              }
            }}
            onClose={() => setBatchOpen(false)}
            onSaved={() => {
              setBatchOpen(false);
              setMessage('Draft saved.');
            }}
          />
        ) : undefined
      }
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
