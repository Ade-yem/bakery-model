/**
 * @file Unit tests for the reusable React Error Boundary component.
 * Verifies error catching, branded fallback rendering, state reset on retry,
 * navigation actions, and production safety (no raw stack trace exposure).
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';

describe('1. Reusable Error Boundary (ErrorBoundary)', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children normally when no rendering error occurs', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ErrorBoundary>
          <div data-testid="child-content">Normal Operational View</div>
        </ErrorBoundary>
      </MemoryRouter>
    );

    expect(html).toContain('Normal Operational View');
    expect(html).not.toContain('Something went wrong');
  });

  it('updates state via getDerivedStateFromError when an error occurs', () => {
    const testError = new Error('Test rendering crash');
    const newState = ErrorBoundary.getDerivedStateFromError(testError);

    expect(newState).toEqual({
      hasError: true,
      error: testError,
    });
  });

  it('renders branded TallyBakery fallback interface in error state', () => {
    const boundary = new ErrorBoundary({ children: <div>Child</div> });
    boundary.state = {
      hasError: true,
      error: new Error('Unexpected render crash'),
    };

    const rendered = boundary.render();
    const html = renderToStaticMarkup(<MemoryRouter>{rendered}</MemoryRouter>);

    expect(html).toContain('Something went wrong');
    expect(html).toContain('An unexpected error occurred while rendering this page');
    expect(html).toContain('Try Again');
    expect(html).toContain('Go to Home');
    // Design system tokens
    expect(html).toContain('bg-flour');
    expect(html).toContain('text-oven-black');
  });

  it('allows custom home path and home label in fallback interface', () => {
    const boundary = new ErrorBoundary({
      children: <div>Child</div>,
      homePath: '/admin/dashboard',
      homeLabel: 'Go to Admin Dashboard',
    });
    boundary.state = {
      hasError: true,
      error: new Error('Admin view error'),
    };

    const rendered = boundary.render();
    const html = renderToStaticMarkup(<MemoryRouter>{rendered}</MemoryRouter>);

    expect(html).toContain('Go to Admin Dashboard');
    expect(html).toContain('href="/admin/dashboard"');
  });

  it('supports custom fallback React element', () => {
    const boundary = new ErrorBoundary({
      children: <div>Child</div>,
      fallback: <div data-testid="custom-fallback">Custom Alert Frame</div>,
    });
    boundary.state = {
      hasError: true,
      error: new Error('Trigger fallback'),
    };

    const rendered = boundary.render();
    const html = renderToStaticMarkup(<MemoryRouter>{rendered}</MemoryRouter>);

    expect(html).toContain('Custom Alert Frame');
    expect(html).not.toContain('Something went wrong');
  });

  it('supports custom fallbackRender prop with resetErrorBoundary callback', () => {
    const boundary = new ErrorBoundary({
      children: <div>Child</div>,
      fallbackRender: ({ error, resetErrorBoundary }) => (
        <div>
          <span>Crash: {error.message}</span>
          <button type="button" onClick={resetErrorBoundary}>
            Reset Now
          </button>
        </div>
      ),
    });
    boundary.state = {
      hasError: true,
      error: new Error('Custom Error Message'),
    };

    const rendered = boundary.render();
    const html = renderToStaticMarkup(<MemoryRouter>{rendered}</MemoryRouter>);

    expect(html).toContain('Crash: Custom Error Message');
    expect(html).toContain('Reset Now');
  });

  it('invokes onReset and resets error state when resetErrorBoundary is triggered', () => {
    const onResetSpy = vi.fn();
    const boundary = new ErrorBoundary({
      children: <div>Child</div>,
      onReset: onResetSpy,
    });
    boundary.state = {
      hasError: true,
      error: new Error('Error to be reset'),
    };

    boundary.setState = vi.fn((updater) => {
      boundary.state = typeof updater === 'function' ? updater(boundary.state) : updater;
    }) as unknown as typeof boundary.setState;

    boundary.resetErrorBoundary();

    expect(boundary.setState).toHaveBeenCalledWith({
      hasError: false,
      error: null,
    });
    expect(onResetSpy).toHaveBeenCalledTimes(1);
  });

  it('logs error details in componentDidCatch and notifies optional onError callback', () => {
    const onErrorSpy = vi.fn();
    const boundary = new ErrorBoundary({
      children: <div>Child</div>,
      onError: onErrorSpy,
    });

    const testError = new Error('Logged crash');
    const errorInfo: React.ErrorInfo = { componentStack: '\n    in TestComponent' };

    boundary.componentDidCatch(testError, errorInfo);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalledWith(testError, errorInfo);
  });

  it('does not expose internal technical stack traces in production view', () => {
    const boundary = new ErrorBoundary({
      children: <div>Child</div>,
    });
    const sensitiveError = new Error('Database password connection timeout at db.internal.secret');
    sensitiveError.stack = 'SecretInternalStack: at internal_driver.js:42:13';

    boundary.state = {
      hasError: true,
      error: sensitiveError,
    };

    const rendered = boundary.render();
    const html = renderToStaticMarkup(<MemoryRouter>{rendered}</MemoryRouter>);

    // Production users must see safe branded copy, never raw stack traces
    expect(html).not.toContain('SecretInternalStack');
    expect(html).not.toContain('internal_driver.js:42:13');
  });
});
