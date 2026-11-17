import { useStaffActions } from '../policy';
import { commitRecord } from '../journal/store';
import { RepaymentPage } from './RepaymentPage';
/** @file Reception application pages using the current local data implementation. */
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from '../StaffShell';
import { receptionAccess } from './data';
import type { ReceptionOrder } from './orders';
import { loadReceptionRecords, storageKey } from './storage';
import { ReceptionHome } from './ReceptionHome';
import {
  ReceptionHeading,
  ReceptionOrders,
  ReceptionTasks,
  ReceptionCustomers,
  ReceptionPersonal,
} from './ReceptionPages';
import { ReceptionHandover } from './ReceptionHandover';
import { OrderEntry } from './OrderEntry';
import { OrderDetail } from './OrderDetail';
import '../workspace.css';
import './reception.css';
/**
 * @description Reuses the staff design with Reception-only customer, payment and dispatch content.
 * @returns Reception pages rendered behind the shared staff route boundary.
 */
export function ReceptionWorkspace({ basePath }: { basePath?: string } = {}) {
  const permissions = useStaffActions();
  const [snapshot, setSnapshot] = useState(loadReceptionRecords);
  useEffect(() => {
    const refresh = () => setSnapshot(loadReceptionRecords());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const [ledgerVersion, setLedgerVersion] = useState(0);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const base = basePath ?? '/workspace/reception';
  const page = location.pathname.slice(base.length).replace(/\/$/, '');
  /**
   * @description Persists a validated local change before exposing success, leaving inputs intact on storage failure.
   * @param order Captured order or validated payment/dispatch transition.
   * @returns Error text on failure, otherwise null; does not contact any server.
   */
  function save(order: ReceptionOrder): string | null {
    if (snapshot.error) return snapshot.error;
    if (
      !snapshot.orders.some((item) => item.id === order.id) &&
      !permissions.allowed('orders:create')
    )
      return 'Your permissions do not allow order entry.';
    const current = loadReceptionRecords();
    if (current.error) return current.error;
    const previous = snapshot.orders.find((item) => item.id === order.id);
    const latest = current.orders.find((item) => item.id === order.id);
    if (JSON.stringify(previous) !== JSON.stringify(latest))
      return 'This order changed on another page. Reload the record before posting; your input has been retained.';
    if (previous && order.creditAuthorized !== previous.creditAuthorized)
      return 'Credit approval must come from an authorized manager.';
    if (
      previous &&
      order.status === 'PUSHED' &&
      previous.status !== 'PUSHED' &&
      !permissions.allowed('orders:push')
    )
      return 'Your permissions do not allow handoff to Disbursement.';
    if (
      previous &&
      order.payments.length !== previous.payments.length &&
      !permissions.allowed('payments:create')
    )
      return 'Your permissions do not allow payment entry.';
    const next = latest
      ? current.orders.map((item) => (item.id === order.id ? order : item))
      : [order, ...current.orders];
    try {
      commitRecord(storageKey, JSON.stringify(next));
      setSnapshot({ orders: next, error: '' });
      setMessage(
        order.status === 'PUSHED'
          ? 'Order marked for Disbursement.'
          : 'Order saved. Push to Disbursement remains a separate action.'
      );
      return null;
    } catch {
      return 'The browser could not save this change. Your input is still here; free storage or allow browser storage and try again.';
    }
  }
  let content;
  if (snapshot.error)
    content = (
      <>
        <ReceptionHeading
          title="Saved records need attention"
          description="Your previous records have been preserved."
        />
        <div className="sw-panel sw-detail">
          <p role="alert" className="sw-field-error">
            {snapshot.error}
          </p>
          <button className="sw-quiet" onClick={() => setSnapshot(loadReceptionRecords())}>
            Retry loading records
          </button>
        </div>
      </>
    );
  else if (page === '')
    content = <ReceptionHome key={ledgerVersion} orders={snapshot.orders} base={base} />;
  else if (page === '/repayments')
    content = (
      <RepaymentPage orders={snapshot.orders} onChanged={() => setLedgerVersion((v) => v + 1)} />
    );
  else if (page === '/handover') content = <ReceptionHandover orders={snapshot.orders} />;
  else if (page === '/tasks') content = <ReceptionTasks orders={snapshot.orders} base={base} />;
  else if (page === '/records') content = <ReceptionOrders orders={snapshot.orders} base={base} />;
  else if (page === '/orders/new')
    content = (
      <OrderEntry
        base={base}
        onSave={(order) => {
          const error = save(order);
          if (!error) navigate(`${base}/records/${order.id}`);
          return error;
        }}
      />
    );
  else if (/^\/records\/[^/]+$/.test(page))
    content = (
      <OrderDetail
        key={page}
        order={snapshot.orders.find((order) => order.id === page.split('/')[2])}
        base={base}
        onSave={save}
      />
    );
  else if (page === '/customers' || page === '/credits')
    content = (
      <ReceptionCustomers orders={snapshot.orders} base={base} credits={page === '/credits'} />
    );
  else if (['/history', '/schedule', '/profile'].includes(page))
    content = <ReceptionPersonal page={page.slice(1)} orders={snapshot.orders} />;
  else
    content = (
      <>
        <ReceptionHeading
          title="Page not found"
          description="This page is not available in the Reception workspace."
        />
        <Link to={base} className="sw-quiet">
          Return to overview
        </Link>
      </>
    );
  return (
    <StaffShell
      base={base}
      department="Reception"
      name="Fatima Ahmed"
      initials="FA"
      role="Receptionist / Cashier"
      access={receptionAccess}
      navigationLabels={{ '/workspace/records': 'Orders & payments' }}
      extraLinks={[
        { path: `${base}/handover`, label: 'Closing & handover' },
        { path: `${base}/customers`, label: 'Customers' },
        { path: `${base}/credits`, label: 'Customer credit' },
        { path: `${base}/repayments`, label: 'Customer repayments' },
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
