import type { ApiClient } from '../api/http';
import { WorkspaceSetup } from '../api/WorkspaceSetup';
import { LiveWorkspace } from '../api/LiveWorkspace';
import { JournalPage } from './journal/JournalPage';
import { StaffShell } from './StaffShell';
import { AssignedAccess, canOpenStaffPath, isKnownStaffPath } from './policy';
import { StaffState } from './StaffState';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { StaffWorkspace } from './StaffWorkspace';
import { ReceptionWorkspace } from './reception/ReceptionWorkspace';
import { DisbursementWorkspace } from './disbursement/DisbursementWorkspace';
import { ProcurementWorkspace } from './procurement/ProcurementWorkspace';
import type { WorkspaceAdapter } from '../integration/workspace';
import { WorkspaceProvider } from '../integration/WorkspaceProvider';
import { useAuth } from '../integration/auth';

/** Staff route boundary. Requires a verified session and explicit backend-resolved assignments. */
export function WorkspaceRoute({
  adapter,
  api,
}: { adapter?: WorkspaceAdapter; api?: ApiClient } = {}) {
  const { pathname } = useLocation();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const auth = useAuth();
  const session = auth.session;
  if (auth.status === 'loading')
    return (
      <StaffState
        title="Checking your session"
        description="Please wait while your access is verified."
      />
    );
  if (auth.status === 'unavailable')
    return (
      <StaffState
        title="Sign-in unavailable"
        description="Sign-in is currently unavailable. Please try again later."
      />
    );
  if (auth.status === 'error')
    return (
      <section className="sw-root sw-session">
        <h1>Session unavailable</h1>
        <p role="alert">{auth.error}</p>
        <button className="sw-primary" onClick={() => void auth.refresh()}>
          Retry
        </button>
      </section>
    );
  if (!session) return <Navigate to="/login" replace />;
  if (session.expiresAt <= now)
    return (
      <StaffState
        title="Session expired"
        description="Sign in again to continue. Your saved work has been retained."
      />
    );
  if (session.accountStatus === 'SUSPENDED' || session.accountStatus === 'INACTIVE')
    return (
      <StaffState
        title="Account unavailable"
        description="Your access has been suspended or deactivated. Contact your business administrator."
      />
    );
  if (session.subscriptionStatus === 'EXPIRED')
    return (
      <StaffState
        title="Business subscription expired"
        description="Your business administrator must restore the subscription before operational access can continue. Your saved work has been retained."
      />
    );
  if (!session.department) return <WorkspaceSetup />;
  if (api)
    return (
      <AssignedAccess.Provider value={session}>
        <LiveWorkspace
          key={`${session.userId}:${session.tenantId}:${session.branchId}:${session.departmentId}`}
          api={api}
          session={session}
        />
      </AssignedAccess.Provider>
    );
  const base = `/workspace/${session.department}`;
  if (pathname === '/workspace' || pathname === '/workspace/')
    return <Navigate to={base} replace />;
  if (pathname !== base && !pathname.startsWith(`${base}/`)) {
    return (
      <div className="sw-root sw-session">
        <h1>Access denied</h1>
        <p>Your account can access only its assigned department.</p>
        <a href={base}>Return to my workspace</a>
      </div>
    );
  }
  const access = { enabledModules: session.enabledModules, permissions: session.permissions };
  const page = pathname.slice(base.length).replace(/\/$/, '');
  if (!isKnownStaffPath(session.department, page))
    return (
      <StaffState
        title="Page not found"
        description="This page is not part of your assigned staff workspace."
        to={base}
        action="Return to my workspace"
      />
    );
  const module = session.department === 'reception' ? 'orders' : session.department;
  if (
    !['/profile', '/sync'].includes(page) &&
    session.planModules &&
    !session.planModules.includes(module)
  )
    return (
      <StaffState
        title="Feature unavailable"
        description="This module is not included in your business plan. Contact your business administrator; saved work has been retained."
        to={`${base}/profile`}
        action="My profile"
      />
    );
  if (!canOpenStaffPath(session.department, page, access))
    return (
      <StaffState
        title="Access denied"
        description="This page is not included in your department assignments and permissions."
        to={`${base}/profile`}
        action="My profile"
      />
    );
  if (page === '/sync')
    return (
      <AssignedAccess.Provider value={access}>
        <WorkspaceProvider adapter={adapter}>
          <StaffShell
            base={base}
            department={session.department.charAt(0).toUpperCase() + session.department.slice(1)}
          >
            <JournalPage department={session.department} />
          </StaffShell>
        </WorkspaceProvider>
      </AssignedAccess.Provider>
    );
  const content =
    session.department === 'procurement' ? (
      <ProcurementWorkspace basePath={base} />
    ) : session.department === 'disbursement' ? (
      <DisbursementWorkspace basePath={base} />
    ) : session.department === 'production' ? (
      <StaffWorkspace basePath={base} />
    ) : (
      <ReceptionWorkspace basePath={base} />
    );
  return (
    <AssignedAccess.Provider value={access}>
      <WorkspaceProvider adapter={adapter}>{content}</WorkspaceProvider>
    </AssignedAccess.Provider>
  );
}
