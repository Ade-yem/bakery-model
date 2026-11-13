/// <reference types="node" />
/** @file Brand consistency contract with the existing landing/auth components. */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Logo } from '../../../components/shared/Logo';
import { StaffWorkspace } from '../StaffWorkspace';
import { readFileSync } from 'node:fs';
const tokens = readFileSync(new URL('../../../styles/variables.css', import.meta.url), 'utf8');
const globalStyles = readFileSync(new URL('../../../styles/global.css', import.meta.url), 'utf8');

describe('Shared visual identity', () => {
  it('uses the existing loaf logo in the staff workspace rather than a second brand mark', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StaffWorkspace preview />
      </MemoryRouter>
    );
    expect(html).toContain('M4 15C4 10.5');
    expect(html).not.toContain('sw-brand-mark');
  });
  it('preserves the default logo destination used by existing auth screens', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );
    expect(html).toContain('href="/"');
  });
  it('keeps the workspace brand link inside the workspace', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Logo to="/workspace-preview" />
      </MemoryRouter>
    );
    expect(html).toContain('href="/workspace-preview"');
  });
  it('declares the agreed Switzer family consistently for app typography', () => {
    expect(tokens).toContain("--font-family-base: 'Switzer'");
    expect(globalStyles).toContain("--font-sans: 'Switzer'");
    expect(tokens + globalStyles).not.toContain('Figtree');
  });
});
