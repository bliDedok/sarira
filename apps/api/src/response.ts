export const success = <T>(data: T, meta: Record<string, unknown> = {}) => ({ success: true as const, data, meta });
export const failure = (code: string, message: string, details: unknown[] = []) => ({ success: false as const, error: { code, message, details } });
