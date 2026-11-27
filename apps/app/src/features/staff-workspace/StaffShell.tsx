import { AssignedAccess, canOpenStaffPath } from './policy';
import { useAuth, type Department } from '../integration/auth';
/** @file Shared staff shell; department pages supply only their own authorized UI. */
import { useContext, useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Files,
  History,
  CalendarDays,
  UserRound,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { GlobalSyncStatus } from '../sync/SyncStatus';
import { Logo } from '@repo/ui/component/Logo';
import { getStaffNavigation, type StaffAccess } from './access';
interface Props {
  base: string;
  department: string;
  children: ReactNode;
  dialog?: ReactNode;
  extraLinks?: { path: string; label: string }[];
  navigationLabels?: Record<string, string>;
  navigationLinks?: { path: string; label: string }[];
  showSyncStatus?: boolean;
}
const navigationIcons = {
  '/workspace': LayoutDashboard,
  '/workspace/tasks': ClipboardList,
  '/workspace/records': Files,
  '/workspace/history': History,
  '/workspace/schedule': CalendarDays,
  '/workspace/profile': UserRound,
};
/**
 * @description Keeps the approved navigation, typography and layout identical across staff departments.
 * @param props Department-specific identity, access hints and page content; no auth is established here.
 * @returns Shared responsive staff presentation shell.
 */
export function StaffShell({
  base,
  department,
  children,
  dialog,
  extraLinks = [],
  navigationLabels = {},
  navigationLinks,
  showSyncStatus = true,
}: Props) {
  const auth = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const assigned = useContext(AssignedAccess);
  const effectiveAccess: StaffAccess = assigned ?? { enabledModules: [], permissions: [] };
  const name = auth.session?.displayName ?? '';
  const role = auth.session?.role ?? '';
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    document.getElementById('staff-content')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="sw-root">
      <a className="sw-skip" href="#staff-content">
        Skip to workspace content
      </a>
      {menuOpen && (
        <button
          className="sw-menu-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`sw-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <Logo variant="dark" to={base} className="sw-brand" />
        <div className="sw-workspace-id">
          <span className="sw-workspace-symbol">
            <ClipboardList size={20} />
          </span>
          <div>
            <strong>{department}</strong>
            <p>{auth.session?.tenantName ?? 'Business workspace'}</p>
          </div>
        </div>
        <p className="sw-nav-caption">My workspace</p>
        <nav aria-label="Staff navigation" onClick={() => setMenuOpen(false)}>
          {navigationLinks
            ? navigationLinks.map((item) => (
                <NavLink end={item.path === base} key={item.path} to={item.path}>
                  <Files size={18} strokeWidth={1.6} />
                  <span>{item.label}</span>
                </NavLink>
              ))
            : getStaffNavigation(effectiveAccess)
                .filter(
                  (item) =>
                    !assigned ||
                    canOpenStaffPath(
                      department.toLowerCase() as Department,
                      item.path.replace('/workspace', ''),
                      effectiveAccess
                    )
                )
                .map((item) => {
                  const Icon = navigationIcons[item.path as keyof typeof navigationIcons];
                  return (
                    <NavLink
                      end={item.path === '/workspace'}
                      key={item.path}
                      to={item.path.replace('/workspace', base)}
                    >
                      <Icon size={18} strokeWidth={1.6} />
                      <span>{navigationLabels[item.path] ?? item.label}</span>
                    </NavLink>
                  );
                })}
          {effectiveAccess.enabledModules.length > 0 && (
            <NavLink to={`${base}/sync`}>
              <ShieldCheck size={18} />
              <span>Pending work & conflicts</span>
            </NavLink>
          )}
          {extraLinks
            .filter(
              (item) =>
                !assigned ||
                canOpenStaffPath(
                  department.toLowerCase() as Department,
                  item.path.slice(base.length),
                  effectiveAccess
                )
            )
            .map((item) => (
              <NavLink key={item.path} to={item.path}>
                <UserRound size={18} strokeWidth={1.6} />
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>
        <div className="sw-sidebar-bottom">
          <div className="sw-scope-note">
            <ShieldCheck size={17} />
            <span>{department} access only</span>
          </div>
          <div className="sw-person">
            <span className="sw-avatar">{initials}</span>
            <div>
              <strong>{name}</strong>
              <p>{role}</p>
            </div>
          </div>
          <button
            className="sw-exit"
            onClick={async () => {
              setLogoutError('');
              try {
                await auth.signOut();
              } catch {
                setLogoutError('Sign-out failed. Please retry.');
              }
            }}
          >
            <LogOut size={16} />
            Log out
          </button>
          {logoutError && <p role="alert">{logoutError}</p>}
        </div>
      </aside>
      <div className="sw-main">
        <header className="sw-topbar">
          <div>
            <button
              className="sw-icon-button sw-menu"
              aria-label={menuOpen ? 'Close staff navigation' : 'Open staff navigation'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span>{auth.session?.branchName}</span>
            <span className="sw-top-divider">/</span>
            <span className="sw-muted">Staff workspace</span>
          </div>
          <span className="sw-muted">{department}</span>
        </header>
        {showSyncStatus && <GlobalSyncStatus />}
        <div className="sw-content" id="staff-content" tabIndex={-1}>
          {children}
          <footer className="sw-footer">
            <span>Cadence · Staff workspace</span>
            <span>Every shift, accounted for.</span>
          </footer>
        </div>
      </div>
      {dialog}
    </div>
  );
}
