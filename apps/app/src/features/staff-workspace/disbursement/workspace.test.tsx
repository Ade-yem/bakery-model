import { dataFor } from '../__tests__/fixtures/data';
import type { DisbursementData } from '../../integration/workspace';
import type { State, Action } from './model';
const source = dataFor('disbursement') as DisbursementData;
const applyAction = (state: State, action: Action) => apply(state, action, source);
const parseState = (raw: string) => parseLedger(raw, source);
import { TestWorkspace } from '../__tests__/fixtures/workspace';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { DisbursementWorkspace } from './DisbursementWorkspace';
import { applyAction as apply, initialState, parseState as parseLedger } from './model';

afterEach(() => vi.unstubAllGlobals());
describe('quantity-only Disbursement workspace', () => {
  for (const page of [
    '',
    '/tasks',
    '/records',
    '/records/TRF-0186',
    '/records/ORD-0241',
    '/history',
    '/stock',
    '/schedule',
    '/profile',
    '/unknown',
  ]) {
    it(`renders ${page || 'overview'} with no financial or procurement fields`, () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/workspace/disbursement${page}`]}>
          <TestWorkspace department="disbursement">
            <DisbursementWorkspace />
          </TestWorkspace>
        </MemoryRouter>
      );
      expect(html).toContain('<h1');
      expect(html).toContain('Staff navigation');
      expect(html).toContain('Log out');
      expect(html).not.toContain('Sample data');
      expect(html).not.toMatch(
        /₦|cash drawer|sellingPrice|payment reference|flour consumed|supplier|Customer credit/i
      );
      expect(html).not.toContain('href="/platform');
      expect(html).not.toContain('href="/app/');
    });
  }
  it('replays intake, fulfillment and counts without changing finalized evidence', () => {
    const accepted = applyAction(initialState, {
      kind: 'accept',
      id: 'TRF-0190',
      quantity: 100,
      note: '',
    });
    const fulfilled = applyAction(accepted, { kind: 'fulfill', id: 'ORD-0242' });
    const counted = applyAction(fulfilled, {
      kind: 'count',
      id: 'sandwich',
      quantity: 80,
      note: '',
    });
    expect(parseState(JSON.stringify(counted))).toEqual(counted);
    expect(accepted.events).toHaveLength(1);
  });
});
