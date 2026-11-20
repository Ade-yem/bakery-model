/**
 * @file Recent activity feed scoped strictly to the current client business.
 */

import React from 'react';
import { Clock, ShoppingCart, Flame, Shield, Users } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export function RecentActivityFeed(): React.ReactElement {
  const { activity } = useTenant();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
      case 'sale':
        return <ShoppingCart size={14} className="text-[#0B5C63]" />;
      case 'production':
        return <Flame size={14} className="text-[#A9501A]" />;
      case 'staff':
      case 'shift':
        return <Users size={14} className="text-emerald-700" />;
      default:
        return <Shield size={14} className="text-[#10201F]/60" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#D9D3C0] p-5 sm:p-6 shadow-2xs font-sans space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#10201F]">
            Recent Business Activity
          </h3>
          <p className="text-2xs sm:text-xs text-[#10201F]/60">
            Real-time audit log across your workspace
          </p>
        </div>
        <Clock size={16} className="text-[#10201F]/40" />
      </div>

      <div className="divide-y divide-[#D9D3C0]/40">
        {activity.slice(0, 5).map((item) => (
          <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#F6F3EA] flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-[#10201F] truncate">{item.title}</p>
                <span className="text-3xs text-[#10201F]/50 shrink-0">{item.timestamp}</span>
              </div>
              <p className="text-2xs text-[#10201F]/70 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 text-3xs text-[#10201F]/50 pt-0.5">
                <span>By {item.actorName}</span>
                {item.departmentName && <span>• {item.departmentName}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
