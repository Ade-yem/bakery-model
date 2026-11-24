import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { TestWorkspace } from './fixtures/workspace';
import { dataFor } from './fixtures/data';
import { StaffHistory } from '../StaffPages';
import { ReceptionPersonal } from '../reception/ReceptionPages';
import { ProcurementSuppliers } from '../procurement/ProcurementPages';

describe('successfully loaded empty workspace data', () => {
  it('shows an empty production history without seeded activity', () => {
    const data = dataFor('production');
    if (data.department !== 'production') throw new Error('Invalid test data');
    const html = renderToStaticMarkup(
      <TestWorkspace department="production" data={{ ...data, records: [] }}>
        <StaffHistory />
      </TestWorkspace>
    );
    expect(html).toContain('No production activity yet');
    expect(html).not.toContain('BAT-0186');
  });
  it('shows an empty Reception history without changing the selected personal page', () => {
    const html = renderToStaticMarkup(
      <TestWorkspace department="reception">
        <ReceptionPersonal page="history" orders={[]} />
      </TestWorkspace>
    );
    expect(html).toContain('No order activity yet');
    expect(html).not.toContain('My profile');
  });
  it('shows an empty supplier directory without inventing catalogue records', () => {
    const data = dataFor('procurement');
    if (data.department !== 'procurement') throw new Error('Invalid test data');
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <TestWorkspace department="procurement" data={{ ...data, suppliers: [] }}>
          <ProcurementSuppliers />
        </TestWorkspace>
      </MemoryRouter>
    );
    expect(html).toContain('No suppliers available');
    expect(html).not.toContain('Golden Grain Mills');
  });
});
