/**
 * @file Recent activity feed adopting Platform Admin card and list styling.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShoppingCart,
  Flame,
  Users,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export function RecentActivityFeed(): React.ReactElement {
  const { activity } = useTenant();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
      case 'sale':
        return <ShoppingCart className="w-4 h-4 text-verdigris" />;
      case 'production':
        return <Flame className="w-4 h-4 text-copper" />;
      case 'staff':
      case 'shift':
        return <Users className="w-4 h-4 text-status-balanced" />;
      default:
        return <Shield className="w-4 h-4 text-oven-black/60" />;
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-rule shadow-2xs p-5 sm:p-6 flex flex-col justify-between font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-verdigris/10 text-verdigris border border-verdigris/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-oven-black">Recent Activity</h2>
              <p className="text-xs text-oven-black/60">
                Operational audit stream across all branches & departments
              </p>
            </div>
          </div>

          <Link
            to="/business/reports"
            className="text-xs font-semibold text-verdigris hover:text-verdigris-lift transition-colors flex items-center gap-1 group"
          >
            <span>View Full Log</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Activity Items List */}
        <div className="divide-y divide-[#E5E0D0] mt-1">
          {activity.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex items-start gap-3.5 hover:bg-flour/40 -mx-2 px-2 rounded-xl transition-colors"
            >
              <div className="p-2 rounded-xl bg-flour border border-rule mt-0.5 shrink-0 shadow-2xs">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-oven-black truncate">
                    {item.title}
                  </p>
                  <span className="text-xs text-oven-black/50 shrink-0 font-medium">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-oven-black/70 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-oven-black/50">
                  <span>Actor: {item.actorName}</span>
                  {item.departmentName && (
                    <>
                      <span>•</span>
                      <span>{item.departmentName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
