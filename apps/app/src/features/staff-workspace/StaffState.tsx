import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
export function StaffState({
  title,
  description,
  action = 'Back to login',
  to = '/login',
}: {
  title: string;
  description: string;
  action?: string;
  to?: string;
}) {
  return (
    <section className="sw-root sw-session" aria-labelledby="staff-state-title">
      <ShieldCheck size={32} aria-hidden="true" />
      <p className="sw-eyebrow">Cadence · Staff access</p>
      <h1 id="staff-state-title">{title}</h1>
      <p>{description}</p>
      <Link className="sw-primary" to={to}>
        {action}
      </Link>
    </section>
  );
}
