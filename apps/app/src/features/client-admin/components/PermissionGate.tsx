/**
 * @file Access restricted notice rendered when an actor lacks client admin route or action permissions.
 */

import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/shared/Button';

export interface PermissionGateProps {
  permission: string;
}

export function PermissionGate({ permission }: PermissionGateProps): React.ReactElement {
  return (
    <div className="p-6 md:p-12 max-w-2xl mx-auto my-8">
      <div className="bg-white rounded-3xl border border-[#D9D3C0] p-8 shadow-xs text-center space-y-5 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-[#8C1D18]/10 text-[#8C1D18] flex items-center justify-center mx-auto">
          <ShieldX size={28} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-[#10201F]">
            Permission Denied
          </h2>
          <p className="text-xs sm:text-sm text-[#10201F]/70 max-w-md mx-auto leading-relaxed">
            Your user account does not hold the authorized permission (
            <code className="font-mono bg-[#8C1D18]/10 text-[#8C1D18] px-1.5 py-0.5 rounded text-xs font-semibold">
              {permission}
            </code>
            ) required to view or configure this business module.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            to="/business/dashboard"
            icon={<ArrowLeft size={14} />}
            iconPosition="left"
          >
            Return to Overview
          </Button>
        </div>
      </div>
    </div>
  );
}
