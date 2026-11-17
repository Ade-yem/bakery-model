/** @file Isolated Reception preview; no real session or operational mutation is fabricated. */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from '../StaffShell';
import { receptionAccess } from './data';
import type { ReceptionOrder } from './orders';
import { loadReceptionPreview, storageKey } from './storage';
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
 * @returns Labeled local preview; live Reception remains behind the existing session integration boundary.
 */
export function ReceptionWorkspace() {
  const [snapshot, setSnapshot] = useState(loadReceptionPreview);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const base = '/workspace-preview/reception';
  const page = location.pathname.slice(base.length).replace(/\/$/, '');
  /**
   * @description Persists a validated preview change before exposing success, leaving inputs intact on storage failure.
   * @param order Captured order or validated payment/dispatch transition.
   * @returns Error text on failure, otherwise null; does not contact any server.
   */
  function save(order: ReceptionOrder): string | null {
    if (snapshot.error) return snapshot.error;
    const exists = snapshot.orders.some((item) => item.id === order.id);
    const next = exists
      ? snapshot.orders.map((item) => (item.id === order.id ? order : item))
      : [order, ...snapshot.orders];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSnapshot({ orders: next, error: '' });
      setMessage(
        order.status === 'PUSHED'
          ? 'Preview push saved locally. No server dispatch or stock movement occurred.'
          : 'Preview order/payment saved locally. Dispatch remains a separate action.'
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
          description="Your previous preview data has been preserved."
        />
        <div className="sw-panel sw-detail">
          <p role="alert" className="sw-field-error">
            {snapshot.error}
          </p>
          <button className="sw-quiet" onClick={() => setSnapshot(loadReceptionPreview())}>
            Retry loading records
          </button>
        </div>
      </>
    );
  else if (page === '') content = <ReceptionHome orders={snapshot.orders} base={base} />;
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
