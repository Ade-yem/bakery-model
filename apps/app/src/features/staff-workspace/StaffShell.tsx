/** @file Shared staff shell; department pages supply only their own authorized UI. */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
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
import { Logo } from '../../components/shared/Logo';
import { getStaffNavigation, type StaffAccess } from './access';
interface Props {
  base: string;
  department: string;
  name: string;
  initials: string;
  role: string;
  access: StaffAccess;
  children: ReactNode;
  dialog?: ReactNode;
  extraLinks?: { path: string; label: string }[];
  navigationLabels?: Record<string, string>;
}
const navigationIcons = [LayoutDashboard, ClipboardList, Files, History, CalendarDays, UserRound];
/**
 * @description Keeps the approved navigation, typography and layout identical across staff departments.
 * @param props Department-specific identity, access hints and page content; no auth is established here.
 * @returns Shared responsive staff presentation shell.
 */
export function StaffShell({
  base,
  department,
  name,
  initials,
  role,
  access,
  children,
  dialog,
  extraLinks = [],
  navigationLabels = {},
}: Props) {
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
            <p>Tally Artisan Bakery</p>
          </div>
        </div>
        <p className="sw-nav-caption">My workspace</p>
        <nav aria-label="Staff navigation" onClick={() => setMenuOpen(false)}>
          {getStaffNavigation(access).map((item, index) => {
            const Icon = navigationIcons[index];
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
          {extraLinks.map((item) => (
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
          <Link className="sw-exit" to="/login">
            <LogOut size={16} />
            Exit preview
          </Link>
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
            <span>Ikeja branch</span>
            <span className="sw-top-divider">/</span>
            <span className="sw-muted">Staff workspace</span>
          </div>
          <span className="sw-preview-badge">Sample data · UI preview</span>
        </header>
        <div className="sw-preview-notice">
          Preview only. No live shift, stock or server connection. <span>{department} role</span>
        </div>
        <div className="sw-content" id="staff-content" tabIndex={-1}>
          {children}
          <footer className="sw-footer">
            <span>TallyBakery · Staff workspace</span>
            <span>Every shift, accounted for.</span>
          </footer>
        </div>
      </div>
      {dialog}
    </div>
  );
}
