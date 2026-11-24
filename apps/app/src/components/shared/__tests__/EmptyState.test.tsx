/**
 * @file Unit tests for the standardized EmptyState component across Platform Admin and Client Admin.
 * Verifies default and custom variants (no-data, no-search-results, no-filter-match, no-activity, no-period-data),
 * custom actions, accessibility attributes, and conditional loading prevention.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { EmptyState } from '../EmptyState';
import { Sparkles } from 'lucide-react';

describe('1. Standardized EmptyState Component', () => {
  it('renders default no-data empty state with title, description, and inbox icon', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState variant="no-data" />
      </MemoryRouter>
    );

    expect(html).toContain('No records available');
    expect(html).toContain('There are no items recorded in this view yet.');
    expect(html).toContain('role="status"');
  });

  it('renders no-search-results variant with helpful guidance and clear filter context', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState
          variant="no-search-results"
          searchQuery="Nonexistent Bakery"
        />
      </MemoryRouter>
    );

    expect(html).toContain('No results found');
    expect(html).toContain('Nonexistent Bakery');
    expect(html).toContain('Check your spelling or try searching with different keywords.');
  });

  it('renders no-filter-match variant with clear filter prompt', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState variant="no-filter-match" />
      </MemoryRouter>
    );

    expect(html).toContain('No matching filters');
    expect(html).toContain('No records matched your selected criteria. Try adjusting or clearing filters.');
  });

  it('renders no-activity variant for audit and history streams', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState variant="no-activity" />
      </MemoryRouter>
    );

    expect(html).toContain('No activity recorded');
    expect(html).toContain('Operational events and actions will appear here as they occur.');
  });

  it('renders no-period-data variant for time-filtered reporting views', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState variant="no-period-data" />
      </MemoryRouter>
    );

    expect(html).toContain('No data for selected period');
    expect(html).toContain('No transactions or metrics were logged within this date range.');
  });

  it('supports custom heading, description, and custom illustration icon', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState
          icon={<Sparkles data-testid="custom-icon" className="w-8 h-8" />}
          title="Custom Staff Empty Title"
          description="Custom Staff Empty Description"
        />
      </MemoryRouter>
    );

    expect(html).toContain('Custom Staff Empty Title');
    expect(html).toContain('Custom Staff Empty Description');
    expect(html).toContain('custom-icon');
  });

  it('renders primary action button with link or click handler', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState
          title="No Branches Configured"
          action={{
            label: 'Create First Branch',
            to: '/business/branches/new',
          }}
        />
      </MemoryRouter>
    );

    expect(html).toContain('Create First Branch');
    expect(html).toContain('href="/business/branches/new"');
  });

  it('renders secondary action button when provided', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState
          variant="no-filter-match"
          action={{
            label: 'Clear All Filters',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: 'View Documentation',
            to: '/docs',
          }}
        />
      </MemoryRouter>
    );

    expect(html).toContain('Clear All Filters');
    expect(html).toContain('View Documentation');
    expect(html).toContain('href="/docs"');
  });

  it('does not render empty state when isLoading is true', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState
          isLoading={true}
          title="Should Not Render"
        />
      </MemoryRouter>
    );

    expect(html).toBe('');
  });

  it('supports compact mode for widgets and side panels', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EmptyState
          variant="no-activity"
          compact={true}
        />
      </MemoryRouter>
    );

    expect(html).toContain('py-6');
    expect(html).toContain('text-xs');
  });
});
