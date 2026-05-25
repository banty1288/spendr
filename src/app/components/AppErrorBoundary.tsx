import { Component, type ErrorInfo, type ReactNode } from "react";
import { logAppError } from "../../lib/errorReporting";
import { ErrorFallback } from "./ErrorFallback";

interface Props {
  children: ReactNode;
  /** Optional label for console logs */
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
  resetKey: number;
}

const initialState: State = {
  hasError: false,
  error: null,
  componentStack: null,
  resetKey: 0,
};

/**
 * Global error boundary — catches React render/lifecycle errors so the app
 * never stays on a blank white screen (including AI/service failures).
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = initialState;

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const label = this.props.name ? `[${this.props.name}]` : "";
    logAppError(error, { componentStack: info.componentStack });
    console.error(`[Spendr] Error boundary${label} caught:`, error.message);

    this.setState({ componentStack: info.componentStack ?? null });
  }

  handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      componentStack: null,
      resetKey: prev.resetKey + 1,
    }));
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    const { hasError, error, componentStack, resetKey } = this.state;

    if (hasError && error) {
      return (
        <ErrorFallback
          error={error}
          componentStack={componentStack}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return (
      <div key={resetKey} className="contents">
        {this.props.children}
      </div>
    );
  }
}
