/** @file Production staff preview and live session integration boundary. */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';
import { StaffShell } from './StaffShell';
import { previewAccess } from './preview-data';
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
  preview?: boolean;
}
/**
 * @description Provides an isolated production staff UI preview; real workspace routes require backend session integration.
 * @param props Whether the explicitly labeled preview route is being rendered.
 * @returns Responsive staff shell or the unauthenticated integration boundary.
 */
export function StaffWorkspace({ preview = false }: Props) {
  const location = useLocation();
  const [batchOpen, setBatchOpen] = useState(false);
  const [message, setMessage] = useState('');
  const base = '/workspace-preview';
  const page = location.pathname.slice(base.length).replace(/\/$/, '');
  if (!preview)
    return (
      <div className="sw-root sw-session">
        <ShieldCheck size={32} />
        <p className="sw-eyebrow">Staff workspace</p>
        <h1>Sign in to your workspace</h1>
        <p>
          Your session, assigned department and permissions must be verified before your workspace
          can open.
        </p>
        <Link className="sw-primary" to="/login">
          Go to login <ArrowRight size={16} />
        </Link>
        <p className="sw-muted">Workspace session integration is not connected yet.</p>
      </div>
    );
  const openBatch = () => setBatchOpen(true);
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
      name="Ada Okonkwo"
      initials="AO"
      role="Production supervisor"
      access={previewAccess}
      dialog={
        batchOpen ? (
          <BatchDraftDialog
            onClose={() => setBatchOpen(false)}
            onSaved={() => {
              setBatchOpen(false);
              setMessage(
                'Preview draft saved on this browser. It has not been submitted to Production.'
              );
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
