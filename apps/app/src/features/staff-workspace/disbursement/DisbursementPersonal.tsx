import { StaffPersonal } from '../StaffPersonal';
export function DisbursementPersonal({ page }: { page: string }) {
  return <StaffPersonal page={page === 'schedule' ? 'schedule' : 'profile'} />;
}
