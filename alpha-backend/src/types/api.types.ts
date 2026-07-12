// Standard API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
  pagination?: PaginationMeta;
  meta?: {
    requestId?: string;
    timestamp: string;
    version: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // For validation errors
  stack?: string; // Only in development
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Request/Response wrapper types
export interface AuthenticatedRequest {
  user: {
    id: string;
    phoneNumber: string;
    fullName: string;
    status: string;
    isOnboarded: boolean;
  };
  requestId: string;
  ipAddress: string;
  userAgent: string;
}

// Error code constants
export enum ErrorCodes {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',

  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',

  // Authorization Errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',
  CONFLICT = 'CONFLICT',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // OTP Errors
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_INVALID = 'OTP_INVALID',
  OTP_ALREADY_USED = 'OTP_ALREADY_USED',
  OTP_MAX_ATTEMPTS_EXCEEDED = 'OTP_MAX_ATTEMPTS_EXCEEDED',
  OTP_RATE_LIMIT_EXCEEDED = 'OTP_RATE_LIMIT_EXCEEDED',

  // Business Logic Errors
  ONBOARDING_INCOMPLETE = 'ONBOARDING_INCOMPLETE',
  ONBOARDING_ALREADY_COMPLETE = 'ONBOARDING_ALREADY_COMPLETE',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  GOAL_NOT_ACTIVE = 'GOAL_NOT_ACTIVE',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',

  // System Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Phone/SMS Errors
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  SMS_SEND_FAILED = 'SMS_SEND_FAILED',
  PHONE_NUMBER_EXISTS = 'PHONE_NUMBER_EXISTS',
}

// HTTP Status Codes mapping
export const ErrorStatusMap: Record<ErrorCodes, number> = {
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.REQUIRED_FIELD_MISSING]: 400,
  
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.INVALID_TOKEN]: 401,
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  [ErrorCodes.INVALID_CREDENTIALS]: 401,
  [ErrorCodes.ACCOUNT_NOT_VERIFIED]: 401,
  [ErrorCodes.ACCOUNT_SUSPENDED]: 401,
  
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,
  
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.RESOURCE_EXISTS]: 409,
  [ErrorCodes.CONFLICT]: 409,
  
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCodes.TOO_MANY_REQUESTS]: 429,
  
  [ErrorCodes.OTP_EXPIRED]: 400,
  [ErrorCodes.OTP_INVALID]: 400,
  [ErrorCodes.OTP_ALREADY_USED]: 400,
  [ErrorCodes.OTP_MAX_ATTEMPTS_EXCEEDED]: 429,
  [ErrorCodes.OTP_RATE_LIMIT_EXCEEDED]: 429,
  
  [ErrorCodes.ONBOARDING_INCOMPLETE]: 400,
  [ErrorCodes.ONBOARDING_ALREADY_COMPLETE]: 400,
  [ErrorCodes.INSUFFICIENT_BALANCE]: 400,
  [ErrorCodes.GOAL_NOT_ACTIVE]: 400,
  [ErrorCodes.INVALID_AMOUNT]: 400,
  [ErrorCodes.INVALID_DATE_RANGE]: 400,
  
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  
  [ErrorCodes.INVALID_PHONE_NUMBER]: 400,
  [ErrorCodes.SMS_SEND_FAILED]: 502,
  [ErrorCodes.PHONE_NUMBER_EXISTS]: 409,
};

// Helper function to create standardized API responses
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: ApiError,
  pagination?: PaginationMeta
): ApiResponse<T> => {
  return {
    success,
    message,
    data,
    error,
    pagination,
    meta: {
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1',
    },
  };
};

// Helper function to create error responses
export const createErrorResponse = (
  code: ErrorCodes,
  message: string,
  details?: Record<string, any>,
  field?: string
): ApiResponse => {
  return createApiResponse(false, null, undefined, {
    code,
    message,
    details,
    field,
    ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack }),
  });
};

// Helper function to create success responses
export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  pagination?: PaginationMeta
): ApiResponse<T> => {
  return createApiResponse(true, data, message, undefined, pagination);
};

// Query filter types
export interface DateRangeFilter {
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
}

export interface AmountRangeFilter {
  minAmount?: number;
  maxAmount?: number;
}

// Common query parameters
export interface BaseQueryParams extends PaginationRequest {
  search?: string;
  filter?: Record<string, any>;
  include?: string[]; // Relations to include
}

// File upload types
export interface FileUploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}

// Analytics types
export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage: number;
  color?: string;
}

// Notification types
export interface NotificationPayload {
  title: string;
  message: string;
  data?: Record<string, any>;
  type: 'push' | 'sms' | 'email';
  priority?: 'low' | 'medium' | 'high';
}

// Cache keys
export enum CacheKeys {
  USER_PROFILE = 'user:profile:',
  USER_GOALS = 'user:goals:',
  USER_EXPENSES = 'user:expenses:',
  EXPENSE_CATEGORIES = 'expense:categories',
  OTP_ATTEMPTS = 'otp:attempts:',
  RATE_LIMIT = 'rate:limit:',
  SESSION = 'session:',
}

// Background job types
export interface JobData {
  id: string;
  type: string;
  payload: Record<string, any>;
  userId?: string;
  scheduledAt?: Date;
  attempts?: number;
}

export enum JobTypes {
  SEND_NOTIFICATION = 'send_notification',
  GENERATE_AI_INSIGHTS = 'generate_ai_insights',
  CALCULATE_ANALYTICS = 'calculate_analytics',
  CLEANUP_EXPIRED_OTPS = 'cleanup_expired_otps',
  SEND_WEEKLY_SUMMARY = 'send_weekly_summary',
  BACKUP_DATA = 'backup_data',
}