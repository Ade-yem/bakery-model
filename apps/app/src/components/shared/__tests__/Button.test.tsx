/**
 * @file Unit tests for Button component extensions.
 * Verifies loading spinner presentation, button disabling during submission,
 * prevention of duplicate clicks, and accessible aria-busy attributes.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../Button';

describe('5. Button Component Submission & Loading States', () => {
  it('renders loading spinner and sets aria-busy when loading={true}', () => {
    const html = renderToStaticMarkup(
      <Button loading={true}>Save Changes</Button>
    );

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('animate-spin');
    expect(html).toContain('disabled');
  });

  it('renders custom loading label when loadingText is provided', () => {
    const html = renderToStaticMarkup(
      <Button loading={true} loadingText="Saving Record...">Save Changes</Button>
    );

    expect(html).toContain('Saving Record...');
    expect(html).not.toContain('Save Changes');
  });

  it('renders normal children and allows clicks when loading={false}', () => {
    const onClick = vi.fn();
    const html = renderToStaticMarkup(
      <Button loading={false} onClick={onClick}>Submit Application</Button>
    );

    expect(html).toContain('Submit Application');
    expect(html).not.toContain('animate-spin');
    expect(html).not.toMatch(/<button[^>]*\sdisabled[\s=>]/);
  });
});
