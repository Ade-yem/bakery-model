/**
 * @file Multi-select module checkboxes component for the Subscription Plan form.
 */

import React from 'react';
import { CADENCE_MODULES } from '../../mock-plans';

export interface PlanModulesCheckboxesProps {
  /** Selected modules list. */
  includedModules: string[];
  /** Callback fired when a module item is clicked. */
  onToggle: (moduleName: string) => void;
}

/**
 * @description Checkbox grid allowing administrators to toggle business modules included in a plan.
 * @param {PlanModulesCheckboxesProps} props - Component properties.
 * @returns {React.ReactElement} Checkboxes grid element.
 */
export function PlanModulesCheckboxes({
  includedModules,
  onToggle,
}: PlanModulesCheckboxesProps): React.ReactElement {
  return (
    <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-3 font-sans">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B5C63]">
        Included Modules *
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CADENCE_MODULES.map((mod) => (
          <label
            key={mod}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] cursor-pointer hover:bg-[#F6F3EA]"
          >
            <input
              type="checkbox"
              checked={includedModules.includes(mod)}
              onChange={() => onToggle(mod)}
              className="rounded border-[#D9D3C0] text-[#0B5C63] focus:ring-[#0B5C63]"
            />
            <span className="text-xs font-semibold text-[#10201F]">{mod}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
