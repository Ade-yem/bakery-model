/**
 * @file Unit tests for the reusable route loading skeletons component.
 * Verifies accessible role attributes, reduced-motion support, brand design tokens,
 * and distinct layout variations (dashboard, management, detail, general).
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RouteSkeleton } from '../RouteSkeleton';

describe('3. Top-Level Route Loading Skeletons (RouteSkeleton)', () => {
  it('renders accessible status landmark and aria loading announcement', () => {
    const html = renderToStaticMarkup(<RouteSkeleton variant="general" />);

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('Loading page content...');
  });

  it('respects reduced-motion preferences with motion-reduce styles', () => {
    const html = renderToStaticMarkup(<RouteSkeleton />);

    // Should include motion-reduce:animate-none on pulsing elements
    expect(html).toContain('motion-reduce:animate-none');
    expect(html).toContain('animate-pulse');
  });

  it('applies TallyBakery brand color palette to skeleton blocks', () => {
    const html = renderToStaticMarkup(<RouteSkeleton />);

    // Uses Ledger background, Flour borders or Oven-black/10 fills
    expect(html).toContain('bg-[#EFEBDB]');
  });

  describe('Loading Variations', () => {
    it('renders "dashboard" variant with header, metric KPI cards, chart box, and table skeleton', () => {
      const html = renderToStaticMarkup(<RouteSkeleton variant="dashboard" />);

      expect(html).toContain('data-skeleton-variant="dashboard"');
      // 4 stats KPI cards container
      expect(html).toContain('data-testid="skeleton-kpi-grid"');
      // Chart container
      expect(html).toContain('data-testid="skeleton-chart"');
      // Table container
      expect(html).toContain('data-testid="skeleton-table"');
    });

    it('renders "management" variant with header, filter bar, and data table rows', () => {
      const html = renderToStaticMarkup(<RouteSkeleton variant="management" />);

      expect(html).toContain('data-skeleton-variant="management"');
      // Filter bar
      expect(html).toContain('data-testid="skeleton-filter-bar"');
      // Data table rows
      expect(html).toContain('data-testid="skeleton-table"');
    });

    it('renders "detail" variant with header, information panels, and content sections', () => {
      const html = renderToStaticMarkup(<RouteSkeleton variant="detail" />);

      expect(html).toContain('data-skeleton-variant="detail"');
      // Multi-column info panels
      expect(html).toContain('data-testid="skeleton-info-panels"');
      // Content sections
      expect(html).toContain('data-testid="skeleton-content-section"');
    });

    it('renders "general" variant as default fallback with clean layout blocks', () => {
      const html = renderToStaticMarkup(<RouteSkeleton />);

      expect(html).toContain('data-skeleton-variant="general"');
      expect(html).toContain('data-testid="skeleton-general-header"');
      expect(html).toContain('data-testid="skeleton-general-body"');
    });
  });
});
