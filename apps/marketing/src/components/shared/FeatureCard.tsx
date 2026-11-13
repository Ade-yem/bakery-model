/**
 * @file Feature Card component with Finview-inspired rounded cards and circular indicators.
 */

import React from 'react';
import {
  PackageCheck,
  Flame,
  ReceiptText,
  Users,
  Boxes,
  ChefHat,
  CreditCard,
  UserCheck,
  Layers,
  BarChart3,
  Scale,
  Check,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  PackageCheck,
  Flame,
  ReceiptText,
  Users,
  Boxes,
  ChefHat,
  CreditCard,
  UserCheck,
  Layers,
  BarChart3,
  Scale,
};

export interface FeatureCardProps {
  id?: string;
  title: string;
  description: string;
  shortDescription?: string;
  iconName: string;
  items?: string[];
  operationalRole?: string;
  className?: string;
}

/**
 * @description Card representing a specific TallyBakery module with Finview card aesthetics.
 * @param {FeatureCardProps} props - Module data.
 * @returns {React.ReactElement} Feature card element.
 */
export function FeatureCard({
  title,
  description,
  shortDescription,
  iconName,
  items,
  operationalRole,
  className = '',
}: FeatureCardProps): React.ReactElement {
  const IconComponent = ICON_MAP[iconName] || Boxes;

  return (
    <div
      className={`group bg-[#EFEBDB]/70 rounded-3xl p-6 sm:p-7 border border-[#D9D3C0] hover:border-[#0B5C63]/60 hover:bg-[#EFEBDB] transition-all duration-200 flex flex-col justify-between shadow-2xs ${className}`}
    >
      <div>
        {/* Top: Icon in circle and optional operational badge */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center transition-transform group-hover:scale-105 border border-[#0B5C63]/20">
            <IconComponent className="w-6 h-6 text-[#0B5C63]" aria-hidden="true" />
          </div>
          {operationalRole && (
            <span className="px-3 py-1 text-[11px] font-semibold text-[#0B5C63] bg-[#F6F3EA] border border-[#0B5C63]/25 rounded-full">
              {operationalRole}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-[#10201F] tracking-tight mb-2">
          {title}
        </h3>

        {shortDescription && (
          <p className="text-xs font-semibold text-[#A9501A] uppercase tracking-wider mb-2">
            {shortDescription}
          </p>
        )}

        <p className="text-xs text-[#10201F]/80 leading-relaxed mb-5">
          {description}
        </p>

        {items && items.length > 0 && (
          <div className="pt-4 border-t border-[#D9D3C0]/60">
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-[#10201F]/90">
                  <span className="w-4 h-4 rounded-full bg-[#0B5C63]/15 text-[#0B5C63] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom circular link button */}
      <div className="mt-5 pt-3 border-t border-[#D9D3C0]/40 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#0B5C63] group-hover:underline">
          Explore Module
        </span>
        <div className="w-8 h-8 rounded-full bg-[#F6F3EA] border border-[#D9D3C0] text-[#0B5C63] flex items-center justify-center group-hover:bg-[#0B5C63] group-hover:text-[#F6F3EA] transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
