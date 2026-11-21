import { TestWorkspace } from '../__tests__/fixtures/workspace';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ProcurementWorkspace } from './ProcurementWorkspace';
import { parseDraft } from './model';
afterEach(() => vi.unstubAllGlobals());
describe('Procurement workspace', () => {
  for (const path of [
    '',
    '/tasks',
    '/records',
    '/records/REC-0101',
    '/suppliers',
    '/history',
    '/schedule',
    '/profile',
    '/unknown',
  ]) {
    it(`renders ${path || 'home'} without forbidden customer, drawer or fulfillment controls`, () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/workspace/procurement${path}`]}>
          <TestWorkspace department="procurement">
            <ProcurementWorkspace />
          </TestWorkspace>
        </MemoryRouter>
      );
      expect(html).toContain('<h1');
      expect(html).not.toMatch(
        /cash drawer|Customer credit|Confirm sample fulfillment|Push to Disbursement/
      );
      expect(html).not.toContain('href="/app/');
      expect(html).not.toContain('href="/platform');
    });
  }
  it('validates incomplete drafts without treating them as posted receipts', () => {
    const draft = {
      id: 'REC-draft',
      supplierId: 'mill',
      materialId: 'flour',
      quantity: '',
      unitCost: '',
      reference: '',
      receivedOn: '',
      note: '',
    };
    expect(parseDraft(JSON.stringify(draft))).toEqual(draft);
    expect(parseDraft(JSON.stringify({ ...draft, supplierId: 1 }))).toBeNull();
    expect(parseDraft('{')).toBeNull();
  });
});
