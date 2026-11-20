/**
 * @file Quick action shortcut buttons displayed on the business overview.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, CalendarPlus, FolderPlus, UserPlus } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export function QuickActionsBar(): React.ReactElement {
  const { subscription } = useTenant();

  return (
    <div className="bg-[#10201F] rounded-3xl p-5 sm:p-6 text-[#F6F3EA] shadow-sm font-sans space-y-4">
      <div>
        <h3 className="text-base font-extrabold text-white">
          Workspace Quick Actions
        </h3>
        <p className="text-2xs sm:text-xs text-white/60">
          Fast shortcuts to configure and manage your business operations
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Link
          to="/business/departments"
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <FolderPlus size={20} className="text-[#0B5C63]" />
          <span className="text-xs font-bold text-white">Add Department</span>
        </Link>

        <Link
          to="/business/staff"
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <UserPlus size={20} className="text-emerald-400" />
          <span className="text-xs font-bold text-white">Invite Staff</span>
        </Link>

        <Link
          to="/business/shifts"
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <CalendarPlus size={20} className="text-[#A9501A]" />
          <span className="text-xs font-bold text-white">Create Shift</span>
        </Link>

        {subscription.isMultiBranchSupported ? (
          <Link
            to="/business/branches"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <PlusCircle size={20} className="text-amber-400" />
            <span className="text-xs font-bold text-white">Add Branch</span>
          </Link>
        ) : (
          <Link
            to="/business/profile"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <PlusCircle size={20} className="text-white/40" />
            <span className="text-xs font-bold text-white">Edit Profile</span>
          </Link>
        )}
      </div>
    </div>
  );
}
