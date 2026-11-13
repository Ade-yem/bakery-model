/**
 * @file Public website footer component matching Finview footer structure.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../shared/Logo';
import { FOOTER_SECTIONS } from '../../data/navigation';

const CURRENT_YEAR = 2026;

/**
 * @description Master footer for TallyBakery public pages with organized navigation columns.
 * @returns {React.ReactElement} Comprehensive footer.
 */
export function Footer(): React.ReactElement {
  return (
    <footer className="bg-[#10201F] text-[#E9E4D2] border-t border-[#0F7480]/20 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-12 border-b border-[#D9D3C0]/15">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo variant="dark" showTagline={true} />
            <p className="text-xs sm:text-sm text-[#E9E4D2]/75 leading-relaxed max-w-sm mt-2">
              The connected business operations and reconciliation platform designed for businesses
              across industries. Manage inventory, production, sales, staff, and financial records
              with accuracy and complete operational visibility.
            </p>

            {/* Contact Placeholders */}
            {/* <div className="flex flex-col gap-2 mt-2 text-xs text-[#E9E4D2]/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#52C2C9]" aria-hidden="true" />
                <span>Bakery District, Central City (HQ Office)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#52C2C9]" aria-hidden="true" />
                <span>+1 (800) 555-BAKE (Mon–Fri, 7am–6pm EST)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#52C2C9]" aria-hidden="true" />
                <span>inquiries@tallybakery.com</span>
              </div>
            </div> */}
          </div>

          {/* Nav Link Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#52C2C9]">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs sm:text-sm text-[#E9E4D2]/75 hover:text-[#52C2C9] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter & Bottom Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright & Finview Circular Social Icons */}
          <div className="flex flex-col items-center md:items-end gap-3 text-xs text-[#E9E4D2]/60">
            <p>© {CURRENT_YEAR} TallyBakery SaaS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
