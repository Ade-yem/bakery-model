/**
 * @file Floating scroll-to-top button matching the Finview rounded square button.
 * Appears when user scrolls down and smoothly returns to the top of the page.
 */

import React, { useState, useEffect } from 'react';
import { ChevronsUp } from 'lucide-react';

/**
 * @description Floating scroll-to-top button styled like the Finview floating widget.
 * @returns {React.ReactElement | null} Scroll-to-top button.
 */
export function ScrollUpButton(): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      className="fixed bottom-6 right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0B5C63] hover:bg-[#0F7480] text-[#F6F3EA] shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:ring-offset-2 border border-[#0F7480]/40"
    >
      <ChevronsUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
    </button>
  );
}
