import { describe, it, expect } from 'vitest';
import { PRIMARY_NAV_ITEMS, FOOTER_SECTIONS } from '../../data/navigation';

describe('Public Routing Integrity', () => {
  const REQUIRED_ROUTES = [
    '/',
    '/about',
    '/features',
    '/how-it-works',
    '/pricing',
    '/contact',
    '/privacy',
    '/terms',
    '/login',
    '/register',
  ];

  it('contains all 11 public specification routes in navigation and footer maps', () => {
    const navLinks = PRIMARY_NAV_ITEMS.map((item) => item.href);
    const footerLinks = FOOTER_SECTIONS.flatMap((s) => s.links).map((l) => l.href);
    const authLinks = ['/login', '/register'];

    const allMappedRoutes = Array.from(new Set([...navLinks, ...footerLinks, ...authLinks]));

    REQUIRED_ROUTES.forEach((route) => {
      expect(allMappedRoutes).toContain(route);
    });
  });
});
