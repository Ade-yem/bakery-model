import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Logo } from '@repo/ui/component/Logo';
import { useAuth, type WorkspaceChoice } from '../integration/auth';
import { ApiError } from './http';
import '../staff-workspace/workspace.css';

export function WorkspaceSetup() {
  const auth = useAuth();
  const posting = useRef(false);
  const location = useLocation();
  const [choices, setChoices] = useState<WorkspaceChoice[] | null>(null),
    [error, setError] = useState('');
  const [branchId, setBranchId] = useState(''),
    [departmentId, setDepartmentId] = useState('');
  const [businessName, setBusinessName] = useState(() =>
    typeof location.state?.businessName === 'string' ? location.state.businessName : ''
  );
  const [busy, setBusy] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [attempt, setAttempt] = useState(0);
  const session = auth.session;
  useEffect(() => {
    let active = true;
    if (session?.tenantId && auth.client?.workspaces)
      void auth.client
        .workspaces()
        .then((value) => {
          if (active) setChoices(value);
        })
        .catch(() => {
          if (active) setError('Available workspaces could not be loaded. Please retry.');
        });
    return () => {
      active = false;
    };
  }, [auth.client, session, attempt]);
  if (!session) return null;
  const departments = choices?.find((c) => c.branchId === branchId)?.departments ?? [];
  async function signOut() {
    setBusy(true);
    try {
      await auth.signOut();
    } catch {
      setError('Sign-out failed. Please retry.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="sw-root sw-session">
      <div className="sw-panel sw-detail api-setup">
        <Logo />
        <h1>{session.tenantId ? 'Choose your workspace' : 'Set up your business'}</h1>
        <p>Signed in as {session.displayName}.</p>
        {error && (
          <p role="alert" className="sw-field-error">
            {error}
          </p>
        )}
        {!session.tenantId ? (
          <form
            className="api-form"
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy || posting.current || uncertain || !auth.onboardBusiness) return;
              posting.current = true;
              setError('');
              setBusy(true);
              try {
                if (!businessName.trim() || businessName.trim().length > 120)
                  throw new Error('Enter a business name of up to 120 characters.');
                await auth.onboardBusiness(businessName);
              } catch (cause) {
                setUncertain(cause instanceof ApiError && cause.outcomeUnknown);
                setError(
                  cause instanceof Error
                    ? cause.message
                    : 'Business setup could not be completed. Your input is retained.'
                );
              } finally {
                posting.current = false;
                setBusy(false);
              }
            }}
          >
            <label>
              Business name
              <input
                value={businessName}
                maxLength={120}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </label>
            <button className="sw-primary" disabled={busy || uncertain || !auth.onboardBusiness}>
              {busy ? 'Creating business…' : 'Create business'}
            </button>
            {uncertain && (
              <>
                <p>Check whether setup completed before submitting again.</p>
                <button type="button" className="sw-quiet" onClick={() => void auth.refresh()}>
                  Check setup status
                </button>
              </>
            )}
          </form>
        ) : choices === null ? (
          <>
            <p role="status">
              {error ? 'Workspace selection is unavailable.' : 'Loading your workspaces…'}
            </p>
            {error && (
              <button
                className="sw-quiet"
                onClick={() => {
                  setError('');
                  setAttempt((a) => a + 1);
                }}
              >
                Retry loading workspaces
              </button>
            )}
          </>
        ) : choices.every((c) => !c.departments.length) ? (
          <p>
            No supported active workspace is available for your account. Contact your business
            administrator.
          </p>
        ) : (
          <form
            className="api-form"
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy || posting.current || !auth.selectWorkspace) return;
              posting.current = true;
              setError('');
              setBusy(true);
              try {
                if (!branchId || !departmentId) throw new Error('Select a branch and department.');
                await auth.selectWorkspace(branchId, departmentId);
              } catch (cause) {
                setError(
                  cause instanceof Error ? cause.message : 'Workspace access could not be verified.'
                );
              } finally {
                posting.current = false;
                setBusy(false);
              }
            }}
          >
            <label>
              Branch
              <select
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setDepartmentId('');
                }}
              >
                <option value="">Select branch</option>
                {choices
                  .filter((c) => c.departments.length)
                  .map((c) => (
                    <option key={c.branchId} value={c.branchId}>
                      {c.branchName}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Department
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!branchId}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="sw-primary" disabled={busy || !branchId || !departmentId}>
              {busy ? 'Checking access…' : 'Open workspace'}
            </button>
          </form>
        )}
        <button className="sw-quiet" onClick={() => void signOut()} disabled={busy}>
          Sign out
        </button>
      </div>
    </section>
  );
}
