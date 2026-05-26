import { AlertCircle, Brain, RefreshCw, Sparkles } from "lucide-react";
import {
  getPublicErrorMessage,
  isAiRelatedError,
} from "../../lib/errorReporting";

export interface ErrorFallbackProps {
  error: Error;
  componentStack?: string | null;
  onRetry: () => void;
  onReload: () => void;
}

export function ErrorFallback({
  error,
  componentStack,
  onRetry,
  onReload,
}: ErrorFallbackProps) {
  const isDev = import.meta.env.DEV;
  const aiError = isAiRelatedError(error);
  const publicMessage = getPublicErrorMessage(error, isDev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-[430px] w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-card via-black to-card" />


        <div className="relative z-10 w-full flex flex-col items-center text-center px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00d9ff] to-[#00ff88] rounded-2xl blur-lg opacity-40" />
            <div className="relative bg-gradient-to-br from-card to-card border border-border p-5 rounded-2xl">
              {aiError ? (
                <Brain size={40} className="text-[#00d9ff] mx-auto" />
              ) : (
                <AlertCircle size={40} className="text-[#ffd60a] mx-auto" />
              )}
            </div>
            <Sparkles
              size={18}
              className="absolute -top-1 -right-1 text-[#00ff88]"
            />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {aiError ? "Insights paused" : "Spendr hit a snag"}
          </h1>

          <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
            {publicMessage}
          </p>

          <div className="flex flex-col w-full max-w-xs gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={18} />
              Try again
            </button>
            <button
              type="button"
              onClick={onReload}
              className="w-full px-6 py-3 rounded-xl border border-white/15 text-white/80 text-sm hover:bg-card shadow-sm transition-colors"
            >
              Reload app
            </button>
          </div>

          {isDev && (
            <details className="mt-8 w-full max-w-xs text-left">
              <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60">
                Developer details
              </summary>
              <div className="mt-3 p-3 rounded-lg bg-card shadow-sm border border-border overflow-auto max-h-48">
                <p className="text-[#00d9ff] text-xs font-mono mb-2">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="text-white/50 text-[10px] font-mono whitespace-pre-wrap break-words">
                    {error.stack}
                  </pre>
                )}
                {componentStack && (
                  <pre className="text-white/40 text-[10px] font-mono whitespace-pre-wrap break-words mt-3 pt-3 border-t border-border">
                    {componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
