import { useEffect, useState } from 'react';
import { useAuth } from '../integration/auth';
import { useWorkspace } from '../integration/workspace';
export function useStaffIdentity() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const { session } = useAuth();
  const { data } = useWorkspace();
  return {
    name: session?.displayName ?? '',
    branch: session?.branchName ?? '',
    shift: data.shift,
    date: new Date(now).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: data.shift?.timeZone ?? 'Africa/Lagos',
    }),
    shiftLabel: data.shift
      ? `${data.shift.label} · ${new Date(data.shift.startsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: data.shift.timeZone })}–${new Date(data.shift.endsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: data.shift.timeZone })}`
      : 'No active shift assigned',
  };
}
