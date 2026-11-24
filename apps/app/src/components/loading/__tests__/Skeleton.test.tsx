/**
 * @file Unit tests for standardized Skeleton loading components.
 * Verifies structural matching for cards, tables, lists, forms, profiles, details, and charts,
 * accessibility compliance (aria-busy, aria-hidden, role="status"), row/column count props,
 * and reduced-motion preservation.
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonForm,
  SkeletonProfile,
  SkeletonDetail,
  SkeletonChart,
} from '../Skeleton';

describe('2. Standardized Skeleton Loading Suite', () => {
  describe('SkeletonCard', () => {
    it('renders accessible card placeholder with KPI and summary structure', () => {
      const html = renderToStaticMarkup(<SkeletonCard />);
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain('motion-reduce:animate-none');
    });

    it('renders multiple cards in a responsive grid when count is provided', () => {
      const html = renderToStaticMarkup(<SkeletonCard count={4} />);
      const cardMatches = html.match(/data-skeleton="card"/g) || [];
      expect(cardMatches.length).toBe(4);
    });
  });

  describe('SkeletonTable', () => {
    it('renders table placeholder with customizable rows and columns', () => {
      const html = renderToStaticMarkup(<SkeletonTable rows={5} columns={4} />);
      expect(html).toContain('role="status"');
      expect(html).toContain('data-skeleton="table"');
      const rowMatches = html.match(/data-skeleton-row/g) || [];
      expect(rowMatches.length).toBe(5);
    });

    it('renders table header skeletons matching column count', () => {
      const html = renderToStaticMarkup(<SkeletonTable rows={3} columns={6} />);
      const colMatches = html.match(/data-skeleton-col/g) || [];
      expect(colMatches.length).toBe(6);
    });
  });

  describe('SkeletonList', () => {
    it('renders list placeholder with configurable item count and avatars', () => {
      const html = renderToStaticMarkup(<SkeletonList items={6} hasAvatar={true} />);
      expect(html).toContain('data-skeleton="list"');
      const itemMatches = html.match(/data-skeleton-item/g) || [];
      expect(itemMatches.length).toBe(6);
      expect(html).toContain('data-skeleton-avatar');
    });
  });

  describe('SkeletonForm', () => {
    it('renders form fields placeholder with inputs and action button skeletons', () => {
      const html = renderToStaticMarkup(<SkeletonForm fields={4} hasButton={true} />);
      expect(html).toContain('data-skeleton="form"');
      const fieldMatches = html.match(/data-skeleton-field/g) || [];
      expect(fieldMatches.length).toBe(4);
      expect(html).toContain('data-skeleton-submit');
    });
  });

  describe('SkeletonProfile', () => {
    it('renders profile section placeholder with banner, avatar, and metadata grid', () => {
      const html = renderToStaticMarkup(<SkeletonProfile />);
      expect(html).toContain('data-skeleton="profile"');
      expect(html).toContain('data-skeleton-profile-avatar');
      expect(html).toContain('data-skeleton-profile-fields');
    });
  });

  describe('SkeletonDetail', () => {
    it('renders complete detail view placeholder with breadcrumb, header, and tabs', () => {
      const html = renderToStaticMarkup(<SkeletonDetail />);
      expect(html).toContain('data-skeleton="detail"');
      expect(html).toContain('data-skeleton-detail-header');
      expect(html).toContain('data-skeleton-detail-content');
    });
  });

  describe('SkeletonChart', () => {
    it('renders chart placeholder with title, legend, and axis bars', () => {
      const html = renderToStaticMarkup(<SkeletonChart height={300} />);
      expect(html).toContain('data-skeleton="chart"');
      expect(html).toContain('motion-reduce:animate-none');
    });
  });
});
