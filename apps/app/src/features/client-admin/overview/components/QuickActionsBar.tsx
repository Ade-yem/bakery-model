/**
 * @file Client Admin Quick Actions panel adopting the Platform Admin design standards.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderPlus,
  UserPlus,
  CalendarPlus,
  PlusCircle,
  Zap,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export function QuickActionsBar(): React.ReactElement {
  const { subscription } = useTenant();

  const actions = [
    {
      id: 'departments',
      label: 'Add Department',
      description: 'Create and configure functional bakery units',
      path: '/business/departments',
      icon: <FolderPlus className="w-4 h-4 text-verdigris" />,
    },
    {
      id: 'staff',
      label: 'Invite Staff',
      description: 'Onboard new workers with roles & department permissions',
      path: '/business/staff',
      icon: <UserPlus className="w-4 h-4 text-status-balanced" />,
    },
    {
      id: 'shifts',
      label: 'Schedule Shift',
      description: 'Plan daily rosters, shift hours & conflict checks',
      path: '/business/shifts',
      icon: <CalendarPlus className="w-4 h-4 text-copper" />,
    },
    subscription.isMultiBranchSupported
      ? {
          id: 'branches',
          label: 'Add Branch',
          description: 'Register a new retail counter or production facility',
          path: '/business/branches',
          icon: <PlusCircle className="w-4 h-4 text-verdigris" />,
        }
      : {
          id: 'profile',
          label: 'Business Profile',
          description: 'Update organization legal identity and brand logo',
          path: '/business/profile',
          icon: <PlusCircle className="w-4 h-4 text-copper" />,
        },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-rule shadow-2xs font-sans">
      <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E0D0]">
        <div className="p-2 rounded-xl bg-verdigris/10 text-verdigris border border-verdigris/20">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-oven-black">Quick Actions</h2>
          <p className="text-xs text-oven-black/60">
            Frequently performed bakery workspace operations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.path}
            className="p-4 rounded-xl bg-flour border border-rule hover:border-[#C8C2AD] hover:bg-[#EFEBDB] transition-all duration-200 group flex flex-col justify-between cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-white border border-rule shadow-2xs group-hover:scale-105 transition-transform">
                {action.icon}
              </div>
            </div>

            <div className="mt-3">
              <span className="font-bold text-sm text-oven-black group-hover:text-verdigris transition-colors block">
                {action.label}
              </span>
              <span className="text-xs text-oven-black/60 mt-0.5 line-clamp-2 leading-relaxed">
                {action.description}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
