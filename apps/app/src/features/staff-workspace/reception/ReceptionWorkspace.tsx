import { useStaffActions } from '../policy';
import { useDepartmentData, useWorkspace } from '../../integration/workspace';
import { RepaymentPage } from './RepaymentPage';
/** @file Reception application pages using the current local data implementation. */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { StaffShell } from '../StaffShell';
import type { ReceptionOrder } from './orders';
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
  const data = useDepartmentData('reception');
  const workspace = useWorkspace();
  const snapshot = { orders: data.orders };
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
  async function save(order: ReceptionOrder): Promise<string | null> {
    const previous = data.orders.find((item) => item.id === order.id);
    try {
      if (!previous) {
        permissions.require('orders:create');
        if (order.creditAuthorized) return 'Credit approval must come from an authorized manager.';
        await workspace.submit({ type: 'orders:create', order });
      } else if (order.status === 'PUSHED' && previous.status !== 'PUSHED') {
        permissions.require('orders:push');
        await workspace.submit({ type: 'orders:push', orderId: order.id });
      } else {
        permissions.require('payments:create');
        if (order.creditAuthorized !== previous.creditAuthorized)
          return 'Credit approval must come from an authorized manager.';
        await workspace.submit({
          type: 'payments:create',
          orderId: order.id,
          payments: order.payments.slice(previous.payments.length),
        });
      }
      setMessage('Change recorded. Review the record for its current status.');
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'The change could not be saved. Your input is retained.';
    }
  }
  let content;
  if (page === '')
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
        onSave={async (order) => {
          const error = await save(order);
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
