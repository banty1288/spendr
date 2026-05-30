export type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

interface LogPayload {
  message: string;
  level: LogLevel;
  context?: Record<string, any>;
  error?: Error;
  timestamp: string;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = import.meta.env.DEV;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private captureError(payload: LogPayload) {
    if (this.isDevelopment) {
      const logFn = payload.level === 'error' || payload.level === 'fatal' ? console.error : console.warn;
      logFn(`[${payload.level.toUpperCase()}] ${payload.message}`, payload.error || payload.context);
      return;
    }

    // In Production: Send to Sentry, Datadog, etc.
    // Placeholder for actual Sentry integration
    if (window && (window as any).Sentry) {
      (window as any).Sentry.captureException(payload.error || new Error(payload.message), {
        extra: payload.context,
        level: payload.level,
      });
    }
  }

  info(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  warn(message: string, context?: Record<string, any>) {
    this.captureError({ message, level: 'warn', context, timestamp: new Date().toISOString() });
  }

  error(message: string, error?: unknown, context?: Record<string, any>) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.captureError({ message, level: 'error', error: err, context, timestamp: new Date().toISOString() });
  }

  fatal(message: string, error?: unknown, context?: Record<string, any>) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.captureError({ message, level: 'fatal', error: err, context, timestamp: new Date().toISOString() });
  }
}

export const logger = Logger.getInstance();
