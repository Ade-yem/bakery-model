import { JournalPage } from './journal/JournalPage';
import { StaffShell } from './StaffShell';
import { AssignedAccess, departmentAccess, canOpenStaffPath, isKnownStaffPath } from './policy';
import { StaffState } from './StaffState';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { StaffWorkspace } from './StaffWorkspace';
import { ReceptionWorkspace } from './reception/ReceptionWorkspace';
import { DisbursementWorkspace } from './disbursement/DisbursementWorkspace';
import { ProcurementWorkspace } from './procurement/ProcurementWorkspace';
import { DEMO_SESSION_KEY, readDemoSession, isExpiredSession } from '../mock-auth/session';

/** Staff route boundary. Uses the explicitly requested mock session until server auth is integrated. */
export function WorkspaceRoute() {
  const { pathname } = useLocation();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  let raw: string | null = null;
  let session = null;
  try {
    raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    session = readDemoSession(raw);
  } catch {
    /* Storage unavailable. */
  }
  if (!session) {
    if (isExpiredSession(raw, now))
      return (
        <StaffState
          title="Session expired"
          description="Sign in again to continue. Saved drafts and unacknowledged records remain on this device."
        />
      );
    return <Navigate to="/login" replace />;
  }
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
  const fallback = departmentAccess(session.department);
  const access = {
    enabledModules: session.enabledModules ?? fallback.enabledModules,
    permissions: session.permissions ?? fallback.permissions,
  };
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
  const staff = {
    production: { name: 'Ada Okonkwo', initials: 'AO', role: 'Production supervisor' },
    reception: { name: 'Fatima Ahmed', initials: 'FA', role: 'Receptionist / Cashier' },
    disbursement: { name: 'Chidi Nwosu', initials: 'CN', role: 'Disbursement officer' },
    procurement: { name: 'Bisi Afolayan', initials: 'BA', role: 'Procurement officer' },
  }[session.department];
  if (page === '/sync')
    return (
      <AssignedAccess.Provider value={access}>
        <StaffShell
          base={base}
          department={session.department.charAt(0).toUpperCase() + session.department.slice(1)}
          name={staff.name}
          initials={staff.initials}
          role={staff.role}
          access={access}
        >
          <JournalPage department={session.department} />
        </StaffShell>
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
  return <AssignedAccess.Provider value={access}>{content}</AssignedAccess.Provider>;
}
