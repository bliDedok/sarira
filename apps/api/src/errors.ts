import { ZodError } from 'zod';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'AUTHORIZATION_DENIED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export class AppError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly statusCode: number, public readonly details: unknown[] = []) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError { constructor(message = 'Data tidak valid.', details: unknown[] = []) { super('VALIDATION_ERROR', message, 400, details); } }
export class AuthenticationError extends AppError { constructor(message = 'Autentikasi diperlukan.') { super('AUTHENTICATION_REQUIRED', message, 401); } }
export class AuthorizationError extends AppError { constructor(message = 'Anda tidak memiliki akses.') { super('AUTHORIZATION_DENIED', message, 403); } }
export class NotFoundError extends AppError { constructor(message = 'Data tidak ditemukan.') { super('NOT_FOUND', message, 404); } }
export class ConflictError extends AppError { constructor(message = 'Data bertentangan dengan state saat ini.') { super('CONFLICT', message, 409); } }
export class RateLimitError extends AppError { constructor(message = 'Terlalu banyak permintaan.') { super('RATE_LIMITED', message, 429); } }
export class InternalServerError extends AppError { constructor() { super('INTERNAL_ERROR', 'Terjadi kendala internal.', 500); } }

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) return new ValidationError('Data tidak valid.', error.issues);
  return new InternalServerError();
}
