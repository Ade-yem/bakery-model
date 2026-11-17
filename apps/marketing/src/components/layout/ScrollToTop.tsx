/**
 * @file ScrollToTop component ensuring route changes reset page scroll position.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * @description Automatically scrolls window to top on location pathname changes.
 * @returns {null} Renders nothing.
 */
export function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
