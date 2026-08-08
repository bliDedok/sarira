export interface LogContext {
  requestId?: string;
  environment: string;
  module: string;
  action: string;
  status?: string;
  durationMs?: number;
  errorCode?: string;
  [key: string]: unknown;
}

export interface LoggerPort {
  info(context: LogContext, message: string): void;
  warn(context: LogContext, message: string): void;
  error(context: LogContext, message: string): void;
}

const blockedKeys = /password|token|authorization|cookie|secret|health|consentDetail/i;

export function sanitizeLogContext(context: LogContext): LogContext {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, blockedKeys.test(key) ? '[REDACTED]' : value]),
  ) as LogContext;
}

export function createConsoleLogger(): LoggerPort {
  const write = (level: 'info' | 'warn' | 'error', context: LogContext, message: string) => {
    console[level](JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...sanitizeLogContext(context) }));
  };
  return {
    info: (context, message) => write('info', context, message),
    warn: (context, message) => write('warn', context, message),
    error: (context, message) => write('error', context, message),
  };
}

export interface ObservabilityAdapter {
  captureError(error: Error, context: LogContext): void;
  recordMetric(name: string, value: number, context: LogContext): void;
}

export const noopObservability: ObservabilityAdapter = {
  captureError: () => undefined,
  recordMetric: () => undefined,
};
