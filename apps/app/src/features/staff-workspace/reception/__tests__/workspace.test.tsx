import { TestWorkspace } from '../../__tests__/fixtures/workspace';
/** @file Reception rendering and privacy boundaries. */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ReceptionWorkspace } from '../ReceptionWorkspace';
for (const path of [
  '',
  '/tasks',
  '/records',
  '/records/ORD-0248',
  '/customers',
  '/credits',
  '/handover',
  '/history',
  '/schedule',
  '/profile',
  '/orders/new',
]) {
  it(`renders Reception ${path || '/'} with the approved shell and no forbidden operational controls`, () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={[`/workspace/reception${path}`]}>
        <TestWorkspace department="reception">
          <ReceptionWorkspace />
        </TestWorkspace>
      </MemoryRouter>
    );
    expect(html).toContain('Staff navigation');
    expect(html).toContain('Log out');
    expect(html).not.toContain('Sample data');
    expect(html).toContain('Reception');
    expect(html).toContain('<h1');
    expect(html).toContain('M4 15C4 10.5');
    expect(html).not.toMatch(
      /BAT-0186|Flour consumed|Record batch|Mark fulfilled|Accept transfer|Raw material balance/
    );
    expect(html).not.toContain('href="/platform');
  });
}
describe('Reception views', () => {
  it('makes dispatch a separate Reception action and distinguishes credit from cash', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/workspace/reception/records/ORD-0246']}>
        <TestWorkspace department="reception">
          <ReceptionWorkspace />
        </TestWorkspace>
      </MemoryRouter>
    );
    expect(html).toContain('Push to Disbursement');
    expect(html).toContain('Customer credit');
    expect(html).toContain('Money received');
  });
  it('shows an unknown order without leaking another department record', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/workspace/reception/records/BAT-0186']}>
        <TestWorkspace department="reception">
          <ReceptionWorkspace />
        </TestWorkspace>
      </MemoryRouter>
    );
    expect(html).toContain('Order not found');
  });
});
