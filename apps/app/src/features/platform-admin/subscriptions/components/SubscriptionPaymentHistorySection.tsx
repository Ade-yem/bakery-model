/**
 * @file Independent payment records table for the Subscription Details view.
 */

import React from 'react';
import { CreditCard } from 'lucide-react';
import type { PlatformPaymentRecord } from '../../types';

export interface SubscriptionPaymentHistorySectionProps {
  /** Verified payment records list. */
  paymentRecords: PlatformPaymentRecord[];
}

/**
 * @description Renders payment records table with transaction references, methods, amounts, and dates.
 * @param {SubscriptionPaymentHistorySectionProps} props - Component properties.
 * @returns {React.ReactElement} Payment section element.
 */
export function SubscriptionPaymentHistorySection({
  paymentRecords,
}: SubscriptionPaymentHistorySectionProps): React.ReactElement {
  return (
    <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4 font-sans">
      <div className="flex items-center gap-2 text-[#0B5C63]">
        <CreditCard className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
          Payment Information
        </h2>
      </div>
      {paymentRecords.length === 0 ? (
        <p className="text-xs text-[#10201F]/60">
          No payments recorded yet for this billing cycle.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#D9D3C0]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F6F3EA] text-[#10201F] font-bold border-b border-[#D9D3C0]">
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D3C0]/60">
              {paymentRecords.map((pay) => (
                <tr key={pay.id} className="hover:bg-[#FDFCF7]">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0B5C63]">
                    {pay.reference}
                  </td>
                  <td className="py-2.5 px-3">{pay.paymentMethod}</td>
                  <td className="py-2.5 px-3 font-bold">₦{pay.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-3">{new Date(pay.paymentDate).toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-[#2C571D]/10 text-[#2C571D] border border-[#2C571D]/20">
                      {pay.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
