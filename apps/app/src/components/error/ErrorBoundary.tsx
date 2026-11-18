/**
 * @file Reusable React Error Boundary catching unexpected rendering errors with auth-styled error notification.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export interface ErrorBoundaryProps {
  /** Child component subtree to protect. */
  children: ReactNode;
  /** Optional custom static fallback element. */
  fallback?: ReactNode;
  /** Optional custom render function providing error and reset handler. */
  fallbackRender?: (props: { error: Error; resetErrorBoundary: () => void }) => ReactNode;
  /** Optional callback invoked when the boundary resets. */
  onReset?: () => void;
  /** Optional callback invoked when an error is caught. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional override for home destination link. */
  homePath?: string;
  /** Optional override for home link label. */
  homeLabel?: string;
  /** Optional custom title for the fallback screen. */
  title?: string;
  /** Optional custom description for the fallback screen. */
  description?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * @description Catches runtime render errors, displays a branded TallyBakery fallback adopting the auth error styling, and prevents white-screen crashes.
 * @example
 * ```tsx
 * <ErrorBoundary homePath="/admin/dashboard" homeLabel="Back to Dashboard">
 *   <DashboardView />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Updates state so the next render will show the fallback UI.
   * @param {Error} error - The caught runtime error.
   * @returns {ErrorBoundaryState} State with hasError true and captured error.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle hook to log error details and notify listeners.
   * @param {Error} error - The caught error.
   * @param {ErrorInfo} errorInfo - Component stack trace information.
   */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary caught an error]:', error, errorInfo);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Resets the boundary state and invokes the onReset callback.
   */
  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const {
      children,
      fallback,
      fallbackRender,
      homePath = '/',
      homeLabel = 'Go to Home',
      title = 'Something went wrong',
      description = 'An unexpected error occurred while rendering this page. Our team has been notified, and you can try again or return home.',
    } = this.props;

    if (!hasError) {
      return children;
    }

    // 1. Render-prop fallback takes precedence
    if (fallbackRender && error) {
      return fallbackRender({
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }

    // 2. Static custom fallback
    if (fallback) {
      return fallback;
    }

    const isDev = process.env.NODE_ENV !== 'production';

    // 3. Branded TallyBakery fallback interface adopting auth page error design tokens
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-[50vh] flex flex-col items-center justify-center p-6 bg-flour text-oven-black font-sans antialiased"
      >
        <div className="w-full max-w-lg bg-white rounded-2xl border border-rule/80 shadow-md p-6 sm:p-8 text-center animate-fade-in">
          {/* Circular badge adopting auth status-unbalanced styling */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-status-unbalanced/10 border border-status-unbalanced/20 text-[#B3261E] flex items-center justify-center mb-5 shadow-xs">
            <AlertCircle className="w-7 h-7" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-oven-black tracking-tight mb-4">
            {title}
          </h2>

          {/* Error Notice Callout matching auth error banner exactly:
              bg-status-unbalanced/8 border-l-4 border-status-unbalanced text-[#8C1D18] rounded-r-xl rounded-l-md */}
          <div className="mb-6 p-4 rounded-r-xl rounded-l-md border-l-4 text-left text-sm flex items-start gap-3 shadow-xs bg-status-unbalanced/8 border-status-unbalanced text-[#8C1D18]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#B3261E]" aria-hidden="true" />
            <div className="flex-1">
              <span className="leading-relaxed">{description}</span>
            </div>
          </div>

          {/* Optional development error details (safe inspection, hidden in production) */}
          {isDev && error && (
            <div className="mb-6 text-left bg-status-unbalanced/5 border border-status-unbalanced/20 rounded-lg p-3 text-xs text-[#8C1D18] font-mono overflow-auto max-h-32">
              <div className="flex items-center gap-1.5 font-bold text-[#B3261E] mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Dev Inspection</span>
              </div>
              <p className="truncate">{error.name}: {error.message}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.resetErrorBoundary}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-verdigris text-flour hover:bg-verdigris-lift transition-colors cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Try Again</span>
            </button>

            <a
              href={homePath}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-ledger text-oven-black hover:bg-ledger/80 border border-rule transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>{homeLabel}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}
