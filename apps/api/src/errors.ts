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
  | 'SERVICE_UNAVAILABLE'
  | 'FOOD_NOT_FOUND'
  | 'SERVING_NOT_FOUND'
  | 'INVALID_PORTION'
  | 'NUTRITION_DATA_MISSING'
  | 'TARGET_UNAVAILABLE'
  | 'POLICY_NOT_AVAILABLE'
  | 'ALLERGEN_DATA_UNKNOWN'
  | 'CONSENT_REQUIRED'
  | 'BASELINE_NOT_READY'
  | 'INSUFFICIENT_DATA'
  | 'RULE_PACK_NOT_AVAILABLE'
  | 'ANALYSIS_FAILED'
  | 'ANALYSIS_ALREADY_EXISTS'
  | 'ACTION_NOT_ELIGIBLE'
  | 'FORBIDDEN';

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
export class FoodNotFoundError extends AppError { constructor() { super('FOOD_NOT_FOUND', 'Makanan tidak ditemukan.', 404); } }
export class ServingNotFoundError extends AppError { constructor() { super('SERVING_NOT_FOUND', 'Pilihan porsi tidak ditemukan untuk makanan ini.', 404); } }
export class InvalidPortionError extends AppError { constructor(message = 'Porsi tidak dapat dikonversi dengan data yang tersedia.') { super('INVALID_PORTION', message, 422); } }
export class NutritionDataMissingError extends AppError { constructor() { super('NUTRITION_DATA_MISSING', 'Sebagian data nutrisi belum tersedia.', 422); } }
export class TargetUnavailableError extends AppError { constructor(message = 'Target nutrisi belum tersedia untuk profil ini.') { super('TARGET_UNAVAILABLE', message, 409); } }
export class PolicyNotAvailableError extends AppError { constructor() { super('POLICY_NOT_AVAILABLE', 'Policy nutrisi yang sesuai belum tersedia.', 409); } }
export class AllergenDataUnknownError extends AppError { constructor() { super('ALLERGEN_DATA_UNKNOWN', 'Informasi alergen belum lengkap.', 409); } }
export class ConsentRequiredError extends AppError { constructor(message = 'Consent yang diperlukan belum aktif.') { super('CONSENT_REQUIRED', message, 409); } }
export class BaselineNotReadyError extends AppError { constructor() { super('BASELINE_NOT_READY', 'Pattern Map tersedia setelah readiness baseline hari ke-14.', 409); } }
export class InsufficientDataError extends AppError { constructor(message = 'Data belum cukup untuk menghasilkan analisis final.') { super('INSUFFICIENT_DATA', message, 422); } }
export class RulePackNotAvailableError extends AppError { constructor() { super('RULE_PACK_NOT_AVAILABLE', 'Rule pack Phase 7 yang sesuai belum tersedia.', 409); } }
export class AnalysisFailedError extends AppError { constructor() { super('ANALYSIS_FAILED', 'Analisis tidak dapat diselesaikan.', 500); } }
export class AnalysisAlreadyExistsError extends AppError { constructor() { super('ANALYSIS_ALREADY_EXISTS', 'Analisis identik sudah tersedia.', 409); } }
export class ActionNotEligibleError extends AppError { constructor(message = 'Weekly Action tidak lagi eligible untuk profil ini.') { super('ACTION_NOT_ELIGIBLE', message, 409); } }
export class ForbiddenError extends AppError { constructor(message = 'Akses ke data profil ini ditolak.') { super('FORBIDDEN', message, 403); } }

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) return new ValidationError('Data tidak valid.', error.issues);
  return new InternalServerError();
}
