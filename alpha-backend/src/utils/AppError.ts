import { ErrorCodes, ErrorStatusMap } from '../types/api.types';

/**
 * Centralized Application Error Class
 * Provides consistent error handling across all services
 */
export class AppError extends Error {
  public readonly code: ErrorCodes;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;

  constructor(
    code: ErrorCodes,
    message: string,
    details?: Record<string, any>,
    isOperational = true,
  ) {
    super(message);
    this.code = code;
    this.statusCode = ErrorStatusMap[code] ?? 500;
    this.isOperational = isOperational;
    this.details = details;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Create a NOT_FOUND error
   */
  static notFound(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCodes.NOT_FOUND, message, details);
  }

  /**
   * Create a VALIDATION_ERROR
   */
  static validation(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCodes.VALIDATION_ERROR, message, details);
  }

  /**
   * Create an UNAUTHORIZED error
   */
  static unauthorized(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCodes.UNAUTHORIZED, message, details);
  }

  /**
   * Create a FORBIDDEN error
   */
  static forbidden(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCodes.FORBIDDEN, message, details);
  }

  /**
   * Create a CONFLICT error
   */
  static conflict(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCodes.CONFLICT, message, details);
  }

  /**
   * Create an INTERNAL error
   */
  static internal(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCodes.INTERNAL_ERROR, message, details, false);
  }

  /**
   * Create an INVALID_AMOUNT error
   */
  static invalidAmount(message: string): AppError {
    return new AppError(ErrorCodes.INVALID_AMOUNT, message);
  }

  /**
   * Create an INSUFFICIENT_BALANCE error
   */
  static insufficientBalance(message: string): AppError {
    return new AppError(ErrorCodes.INSUFFICIENT_BALANCE, message);
  }

  /**
   * Create an INVALID_DATE_RANGE error
   */
  static invalidDateRange(message: string): AppError {
    return new AppError(ErrorCodes.INVALID_DATE_RANGE, message);
  }

  /**
   * Check if error is an AppError instance
   */
  static isAppError(error: any): error is AppError {
    return error instanceof AppError;
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Get HTTP status code from error code
 */
export const getHttpStatusFromErrorCode = (code: string): number => {
  return (ErrorStatusMap as Record<string, number>)[code] ?? 500;
};

export default AppError;
