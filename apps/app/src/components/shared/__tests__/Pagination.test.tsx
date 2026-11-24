/**
 * @file Unit tests for the standardized reusable Pagination component.
 * Verifies page range calculations ("Showing 1–10 of 86"), numbered pagination with ellipsis truncation,
 * page size selection (10, 15, 20, 50), Previous/Next disabled boundaries, and accessibility.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pagination } from '../Pagination';

describe('3. Standardized Pagination Component', () => {
  it('renders range text correctly for first page: Showing 1–10 of 86', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={1}
        pageSize={10}
        totalRecords={86}
        totalPages={9}
        onPageChange={vi.fn()}
      />
    );

    expect(html).toContain('Showing');
    expect(html).toContain('1–10');
    expect(html).toContain('86');
  });

  it('renders range text correctly for middle page: Showing 21–30 of 86', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={3}
        pageSize={10}
        totalRecords={86}
        totalPages={9}
        onPageChange={vi.fn()}
      />
    );

    expect(html).toContain('21–30');
    expect(html).toContain('86');
  });

  it('renders range text correctly for final partial page: Showing 81–86 of 86', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={9}
        pageSize={10}
        totalRecords={86}
        totalPages={9}
        onPageChange={vi.fn()}
      />
    );

    expect(html).toContain('81–86');
    expect(html).toContain('86');
  });

  it('disables Previous button on page 1 and enables Next button', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={1}
        pageSize={10}
        totalRecords={50}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    // Previous should be disabled
    expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Previous page"/);
    // Next should not be disabled
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*aria-label="Next page"/);
  });

  it('disables Next button on the last page and enables Previous button', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={5}
        pageSize={10}
        totalRecords={50}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    // Next should be disabled
    expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Next page"/);
    // Previous should not be disabled
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*aria-label="Previous page"/);
  });

  it('renders page size selector with options 10, 15, 20, and 50', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={1}
        pageSize={10}
        totalRecords={100}
        totalPages={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        pageSizeOptions={[10, 15, 20, 50]}
      />
    );

    expect(html).toContain('value="10"');
    expect(html).toContain('value="15"');
    expect(html).toContain('value="20"');
    expect(html).toContain('value="50"');
    expect(html).toContain('aria-label="Select records per page"');
  });

  it('renders numbered page buttons with current page marked active', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={3}
        pageSize={10}
        totalRecords={50}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Page 3');
  });

  it('renders ellipsis truncation for long page lists (e.g. page 5 of 20)', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={5}
        pageSize={10}
        totalRecords={200}
        totalPages={20}
        onPageChange={vi.fn()}
      />
    );

    expect(html).toContain('…');
    expect(html).toContain('1');
    expect(html).toContain('20');
  });

  it('handles single-page datasets cleanly without unnecessary page buttons or broken controls', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={1}
        pageSize={10}
        totalRecords={4}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    );

    expect(html).toContain('Showing');
    expect(html).toContain('1–4');
    expect(html).toContain('4');
    // Both Previous and Next should be disabled
    expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Previous page"/);
    expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Next page"/);
  });

  it('handles empty datasets (0 records) cleanly', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={1}
        pageSize={10}
        totalRecords={0}
        totalPages={0}
        onPageChange={vi.fn()}
      />
    );

    expect(html).toContain('0 records');
  });
});
