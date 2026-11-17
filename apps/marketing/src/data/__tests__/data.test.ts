import { describe, it, expect } from 'vitest';
import { PRIMARY_NAV_ITEMS, FOOTER_SECTIONS } from '../navigation';
import { CORE_FEATURES, INTRO_FEATURES } from '../features';
import { PRICING_PLANS } from '../pricing';

describe('Data Definitions & Specification Invariants', () => {
  it('defines all required primary navigation routes', () => {
    const hrefs = PRIMARY_NAV_ITEMS.map((item) => item.href);
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/features');
    expect(hrefs).toContain('/how-it-works');
    expect(hrefs).toContain('/about');
    expect(hrefs).toContain('/pricing');
  });

  it('defines all required footer categories and legal links', () => {
    const titles = FOOTER_SECTIONS.map((s) => s.title);
    expect(titles).toContain('Company');
    expect(titles).toContain('Product');
    expect(titles).toContain('Legal');

    const allFooterLinks = FOOTER_SECTIONS.flatMap((s) => s.links).map((l) => l.href);
    expect(allFooterLinks).toContain('/privacy');
    expect(allFooterLinks).toContain('/terms');
    expect(allFooterLinks).toContain('/contact');
  });

  it('contains exactly 4 introductory features for homepage section 3', () => {
    expect(INTRO_FEATURES).toHaveLength(4);
  });

  it('contains all 7 core operational modules with items and roles', () => {
    expect(CORE_FEATURES.length).toBeGreaterThanOrEqual(7);
    const ids = CORE_FEATURES.map((f) => f.id);
    expect(ids).toContain('inventory');
    expect(ids).toContain('production');
    expect(ids).toContain('sales');
    expect(ids).toContain('staff');
    expect(ids).toContain('departments');
    expect(ids).toContain('analytics');
    expect(ids).toContain('reconciliation');

    CORE_FEATURES.forEach((module) => {
      expect(module.items.length).toBeGreaterThan(0);
      expect(module.operationalRole).toBeDefined();
    });
  });

  it('configures the 3 subscription tiers (Starter, Growth, Business)', () => {
    expect(PRICING_PLANS).toHaveLength(3);
    const planIds = PRICING_PLANS.map((p) => p.id);
    expect(planIds).toEqual(['starter', 'growth', 'business']);

    PRICING_PLANS.forEach((plan) => {
      expect(plan.monthlyPrice).toBeGreaterThan(0);
      expect(plan.annualMonthlyPrice).toBeLessThan(plan.monthlyPrice);
      expect(plan.features.length).toBeGreaterThanOrEqual(5);
    });
  });
});
