import { StaffPersonal } from '../StaffPersonal';
export function ProcurementPersonal({ page }: { page: string }) {
  return <StaffPersonal page={page === 'schedule' ? 'schedule' : 'profile'} />;
}
