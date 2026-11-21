import { useWorkspace } from '../integration/workspace';
export function ShiftBadge({ department }: { department: string }) {
  const { data } = useWorkspace();
  const label =
    data.department !== department
      ? 'Shift unavailable'
      : data.handover?.status === 'SEALED_PENDING_SYNC'
        ? 'Signed · pending sync'
        : data.handover
          ? 'Awaiting incoming signoff'
          : (data.shift?.status ?? 'No active shift');
  return <span className="sw-state sw-open">{label}</span>;
}
