/**
 * @file Public website header and navigation bar.
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Logo } from '../shared/Logo';

/**
 * Navigation item structure for public links.
 */
interface NavLinkItem {
  label: string;
  href: string;
}

/**
 * Public website navigation links self-contained within Navbar.
 */
const PUBLIC_NAV_LINKS: readonly NavLinkItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About Us', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
] as const;

/**
 * @description Master public website navigation bar with brand logo, public links, and auth CTAs.
 * @returns {React.ReactElement} Header navigation bar.
 */
export function Navbar(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);

  // Automatically close mobile drawer when navigation pathname changes
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 bg-[#F6F3EA]/95 backdrop-blur-md transition-colors border-b border-[#D9D3C0]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="shrink-0">
            <Logo showTagline={false} />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="Main Navigation"
          >
            {PUBLIC_NAV_LINKS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-semibold rounded-full transition-colors ${
                    isActive
                      ? 'text-[#0B5C63] font-bold'
                      : 'text-[#10201F]/80 hover:text-[#0B5C63]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Public Actions: Sign In & Get Started */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#10201F]/85 hover:text-[#0B5C63] px-3.5 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0B5C63] text-[#F6F3EA] text-sm font-semibold hover:bg-[#0F7480] transition-colors shadow-xs"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[#10201F] hover:bg-[#EFEBDB] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 top-20 bg-[#10201F]/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#F6F3EA] border-b border-[#D9D3C0] px-6 py-6 shadow-xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {PUBLIC_NAV_LINKS.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-full text-base font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#EFEBDB] text-[#0B5C63]'
                        : 'text-[#10201F] hover:bg-[#EFEBDB]/60'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-[#D9D3C0] flex flex-col gap-2.5">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-1 px-5 py-3 rounded-full bg-[#EFEBDB] border border-[#D9D3C0] text-sm font-semibold text-[#10201F]"
              >
                <span>Sign In</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center gap-1 px-5 py-3 rounded-full bg-[#0B5C63] text-sm font-semibold text-[#F6F3EA]"
              >
                <span>Get Started</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
