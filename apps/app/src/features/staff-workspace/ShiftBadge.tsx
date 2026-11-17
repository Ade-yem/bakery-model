import { useCallback, useEffect, useState } from 'react';
import { readRecord } from './journal/store';
export function ShiftBadge({ department }: { department: string }) {
  const read = useCallback(() => {
    try {
      const raw = readRecord(`tallybakery:${department}:dual-handover:v1`);
      if (!raw) return 'Open shift';
      const value = JSON.parse(raw);
      return value.status === 'SEALED_PENDING_SYNC'
        ? 'Signed · pending sync'
        : value.status === 'AWAITING_INCOMING_SIGNOFF'
          ? 'Awaiting incoming signoff'
          : 'Shift needs review';
    } catch {
      return typeof window === 'undefined' ? 'Open shift' : 'Shift needs review';
    }
  }, [department]);
  const [label, setLabel] = useState(read);
  useEffect(() => {
    const refresh = () => setLabel(read());
    window.addEventListener('storage', refresh);
    window.addEventListener('staff-journal-change', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('staff-journal-change', refresh);
    };
  }, [read]);
  return <span className="sw-state sw-open">{label}</span>;
}
