/**
 * @file Reusable React Error Boundary catching unexpected rendering errors with auth-styled error notification.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, Home } from 'lucide-react';

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

  /**
   * User action handler for 'Try Again' button, resetting state and reloading the window if in browser.
   */
  handleTryAgain = (): void => {
    this.resetErrorBoundary();
    if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
      window.location.reload();
    }
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

    // 3. Branded TallyBakery fallback interface with open illustration layout
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-6 sm:px-6 bg-white text-oven-black font-sans antialiased text-center"
      >
        <div className="w-full max-w-2xl flex flex-col items-center text-center animate-fade-in">
          {/* System error artwork sized to fit viewport without scrolling */}
          <div className="w-full max-w-md mb-4 flex justify-center">
            <img
              src="/images/Computer_repair_404_flat_composition.jpg"
              alt="System Error Illustration"
              className="w-full max-h-56 sm:max-h-72 object-contain mix-blend-multiply select-none"
              loading="eager"
            />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-oven-black tracking-tight mb-2">
            {title}
          </h2>

          {/* Descriptive helper text */}
          <p className="text-xs sm:text-sm text-oven-black/75 max-w-md mb-6 leading-relaxed">
            {description}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={this.handleTryAgain}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-verdigris text-flour hover:bg-verdigris-lift transition-colors cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Try Again</span>
            </button>

            <a
              href={homePath}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-flour text-oven-black hover:bg-flour/80 border border-rule transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
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
