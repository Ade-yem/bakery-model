import { useEffect, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth, type StaffSession } from '../integration/auth';
import { StaffShell } from '../staff-workspace/StaffShell';
import { StaffHeading } from '../staff-workspace/StaffPages';
import { SuppliersPage } from '../staff-workspace/procurement/SuppliersPage';
import { DirectoryDialog } from './DirectoryDialog';
import { loadReferenceData, type ReferenceData } from './reference-data';
import { type ApiClient } from './http';
import { CustomerDirectory, CatalogueDirectory } from './ReferenceDirectories';
import './api.css';

export function LiveWorkspace({ api, session }: { api: ApiClient; session: StaffSession }) {
  const auth = useAuth(),
    { pathname } = useLocation(),
    base = `/workspace/${session.department}`;
  const page = pathname.slice(base.length).replace(/\/$/, '');
  const [loaded, setLoaded] = useState<{ data: ReferenceData | null; error: string }>({
    data: null,
    error: '',
  });
  const [attempt, setAttempt] = useState(0),
    [dialog, setDialog] = useState<'supplier' | 'customer' | null>(null),
    [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    void loadReferenceData(api, session, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setLoaded({ data, error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setLoaded({
            data: null,
            error:
              error instanceof Error ? error.message : 'Workspace records could not be loaded.',
          });
      });
    return () => controller.abort();
  }, [api, session, attempt]);
  const reload = () => {
    setLoaded({ data: null, error: '' });
    setAttempt((a) => a + 1);
  };
  if (pathname === '/workspace' || pathname === '/workspace/')
    return <Navigate to={base} replace />;
  if (pathname !== base && !pathname.startsWith(`${base}/`))
    return (
      <section className="sw-root sw-session">
        <h1>Access denied</h1>
        <p>This URL is outside your selected workspace.</p>
        <Link className="sw-primary" to={base}>
          Return to workspace
        </Link>
      </section>
    );
  const can = (permission: string) => session.permissions.includes(permission);
  const labels = {
    production: 'Production',
    reception: 'Reception',
    disbursement: 'Disbursement',
    procurement: 'Procurement',
  };
  const links = (
    [
      { path: base, label: 'Overview' },
      {
        path: `${base}/catalogue`,
        label:
          session.department === 'production' || session.department === 'procurement'
            ? 'Material catalogue'
            : 'Product catalogue',
        permission: 'items:read',
      },
      ...(session.department === 'procurement'
        ? [
            { path: `${base}/suppliers`, label: 'Suppliers', permission: 'suppliers:read' },
            { path: `${base}/purchase-orders`, label: 'Purchase orders' },
            { path: `${base}/records`, label: 'Receiving ledger' },
          ]
        : session.department === 'reception'
          ? [
              { path: `${base}/customers`, label: 'Customers', permission: 'customers:read' },
              { path: `${base}/records`, label: 'Orders & payments' },
            ]
          : [{ path: `${base}/records`, label: 'Department records' }]),
      { path: `${base}/tasks`, label: 'Department tasks' },
      { path: `${base}/history`, label: 'Activity history' },
      { path: `${base}/schedule`, label: 'My schedule' },
      { path: `${base}/profile`, label: 'My profile' },
    ] as { path: string; label: string; permission?: string }[]
  ).filter((link) => !link.permission || can(link.permission));
  let content;
  if (page === '/profile')
    content = (
      <>
        <StaffHeading
          title="My profile"
          description="Your verified account and selected workspace."
        />
        <section className="sw-panel sw-detail">
          <h2>{session.displayName}</h2>
          <dl>
            {[
              ['Email', session.email],
              ['Role', session.role],
              ['Branch', session.branchName],
              ['Department', session.departmentName ?? labels[session.department]],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <button
            className="sw-quiet"
            onClick={() => {
              auth.client?.clearWorkspace?.();
              void auth.refresh();
            }}
          >
            Change workspace
          </button>
        </section>
      </>
    );
  else if (
    [
      '/tasks',
      '/history',
      '/schedule',
      '/records',
      '/purchase-orders',
      '/stock',
      '/handover',
      '/repayments',
      '/credits',
      '/orders/new',
      '/receipts',
      '/receipts/new',
      '/sync',
    ].includes(page) ||
    page.startsWith('/records/')
  )
    content = (
      <Unavailable
        title={
          page === '/sync'
            ? 'Synchronization unavailable'
            : page === '/schedule'
              ? 'Schedule unavailable'
              : page === '/history'
                ? 'Activity history unavailable'
                : page === '/purchase-orders'
                  ? 'Purchase orders unavailable'
                  : page === '/handover'
                    ? 'Handover unavailable'
                    : 'Operational records unavailable'
        }
      />
    );
  else if (
    (page === '/suppliers' && (session.department !== 'procurement' || !can('suppliers:read'))) ||
    (page === '/customers' && (session.department !== 'reception' || !can('customers:read'))) ||
    (page === '/catalogue' && !can('items:read'))
  )
    content = (
      <StaffHeading
        title="Access denied"
        description="Your assigned permissions do not allow this page."
      />
    );
  else if (!['', '/catalogue', '/suppliers', '/customers'].includes(page))
    content = (
      <StaffHeading
        title="Page not found"
        description="This page is not available in your workspace."
      />
    );
  else if (!loaded.data)
    content = (
      <>
        <StaffHeading
          title={loaded.error ? 'Records unavailable' : 'Loading your workspace'}
          description={loaded.error || 'Loading your authorized records.'}
        />
        {loaded.error ? (
          <section className="sw-panel sw-detail">
            <p role="alert">{loaded.error}</p>
            <button className="sw-primary" onClick={reload}>
              Retry loading records
            </button>
            {loaded.error.includes('sign in') && (
              <Link className="sw-quiet" to="/login">
                Sign in
              </Link>
            )}
          </section>
        ) : (
          <p role="status">Please wait…</p>
        )}
      </>
    );
  else if (!page)
    content = (
      <>
        <StaffHeading
          title={`Welcome, ${session.displayName}.`}
          description={`${session.departmentName ?? labels[session.department]} · ${session.branchName}`}
        />
        <section className="sw-stats">
          {[
            { label: 'Catalogue items', value: loaded.data.items?.length ?? 'Unavailable' },
            { label: 'Current shift', value: 'Unavailable' },
            { label: 'Operational records', value: 'Unavailable' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="sw-stat-title">{stat.label}</p>
              <strong className="sw-stat-value">{stat.value}</strong>
            </div>
          ))}
        </section>
        <section className="sw-panel sw-detail">
          <h2>Your workspace</h2>
          <p>
            Your account and directory records are connected. Operational posting is currently
            unavailable.
          </p>
          <div className="api-links">
            {links
              .filter(
                (link) =>
                  link.path.endsWith('/catalogue') ||
                  link.path.endsWith('/suppliers') ||
                  link.path.endsWith('/customers')
              )
              .map((link) => (
                <Link className="sw-primary" key={link.path} to={link.path}>
                  {link.label}
                </Link>
              ))}
          </div>
        </section>
      </>
    );
  else if (page === '/suppliers')
    content = (
      <SuppliersPage
        suppliers={(loaded.data.suppliers ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          category: null,
          leadTimeDays: null,
          contactName: s.contactName ?? '',
          phone: s.contactPhone ?? '',
          email: s.contactEmail ?? '',
        }))}
        onOpenAddSupplier={can('suppliers:manage') ? () => setDialog('supplier') : undefined}
      />
    );
  else if (page === '/customers')
    content = (
      <CustomerDirectory
        source={loaded.data.customers ?? []}
        permissions={session.permissions}
        onAdd={() => setDialog('customer')}
      />
    );
  else
    content = (
      <CatalogueDirectory
        source={loaded.data.items ?? []}
        department={session.department}
        permissions={session.permissions}
      />
    );

  return (
    <StaffShell
      base={base}
      department={labels[session.department]}
      navigationLinks={links}
      dialog={
        dialog ? (
          <DirectoryDialog
            kind={dialog}
            api={api}
            session={session}
            onClose={() => setDialog(null)}
            onSaved={() => {
              setDialog(null);
              setNotice('Record saved.');
              reload();
            }}
          />
        ) : undefined
      }
    >
      {notice && (
        <p role="status" className="sw-callout">
          {notice}
        </p>
      )}
      {content}
      {['/catalogue', '/suppliers', '/customers'].includes(page) && loaded.data && (
        <button className="sw-quiet api-refresh" onClick={reload}>
          Refresh directory
        </button>
      )}
    </StaffShell>
  );
}
function Unavailable({ title }: { title: string }) {
  return (
    <>
      <StaffHeading
        title={title}
        description="This service is not yet available for your workspace."
      />
      <section className="sw-panel sw-detail">
        <p>This service is currently unavailable. Your existing saved work has been retained.</p>
      </section>
    </>
  );
}
