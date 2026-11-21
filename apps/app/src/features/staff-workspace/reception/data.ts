export const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
});
export const statusLabels = {
  PENDING_SETTLEMENT: 'Settlement required',
  PAID_PENDING_DISPATCH: 'Paid · awaiting push',
  CREDIT_APPROVED_PENDING_DISPATCH: 'Approved credit · awaiting push',
  PUSHED: 'Pushed to Disbursement',
};
