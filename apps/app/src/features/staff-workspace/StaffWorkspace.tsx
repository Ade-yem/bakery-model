import { useStaffActions } from './policy';
import { commitRecord } from './journal/store';
import { receivingResult } from './receiving';
import { ProductionRecords, loadBatches, makeBatch, batchKey } from './production-store';
import { productionRecords as initialBatches } from '../mock-auth/production-data';
/** @file Production staff pages; the router owns session enforcement. */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from './StaffShell';
import { productionAccess } from '../mock-auth/production-data';
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
  const load = () => {
    const loaded = loadBatches();
    if (loaded.error) return loaded;
    try {
      return {
        records: loaded.records.map((batch) => {
          const result = receivingResult(batch.id);
          return result
            ? {
                ...batch,
                state: result.quantity === batch.quantity ? 'Accepted' : 'Accepted with difference',
                accepted: result.quantity,
                receivingNote: result.note,
              }
            : batch;
        }),
        error: '',
      };
    } catch (error) {
      return {
        records: [],
        error: error instanceof Error ? error.message : 'Receiving results are unavailable.',
      };
    }
  };
  const location = useLocation();
  const [batches, setBatches] = useState(load);
  useEffect(() => {
    const refresh = () => setBatches(load());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
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
  if (batches.error)
    content = (
      <>
        <StaffHeading title="Saved batches need attention" description={batches.error} />
        <button className="sw-quiet" onClick={() => setBatches(load())}>
          Retry loading batches
        </button>
      </>
    );
  else if (page === '') content = <StaffHome base={base} onBatch={openBatch} />;
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
    <ProductionRecords.Provider value={batches.records}>
      <StaffShell
        base={base}
        department="Production"
        name="Ada Okonkwo"
        initials="AO"
        role="Production supervisor"
        access={productionAccess}
        dialog={
          batchOpen ? (
            <BatchDraftDialog
              onSubmitBatch={(values) => {
                try {
                  permissions.require('production:create');
                  const current = loadBatches();
                  if (current.error) return current.error;
                  if (current.records.some((r) => r.id === batchId))
                    return 'This batch has already been submitted.';
                  const record = makeBatch(values, batchId);
                  const records = [record, ...current.records];
                  commitRecord(
                    batchKey,
                    JSON.stringify(
                      records.filter((r) => !initialBatches.some((seed) => seed.id === r.id))
                    )
                  );
                  setBatches(load());
                  setBatchOpen(false);
                  setMessage('Batch submitted. Output awaits independent receiving acceptance.');
                  try {
                    localStorage.removeItem('tallybakery:production-draft:v1');
                  } catch {
                    /* Submitted record remains durable. */
                  }
                  return null;
                } catch (failure) {
                  return failure instanceof Error
                    ? failure.message
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
    </ProductionRecords.Provider>
  );
}
