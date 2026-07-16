import { PHONE_CONFIG, REGEX_PATTERNS } from './constants';

// Phone number utilities
export const phoneUtils = {
  /**
   * Normalize Jordan phone number to standard format (+962XXXXXXXXX)
   */
  normalize: (phoneNumber: string): string => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('962')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+962${cleaned.slice(1)}`;
    } else if (cleaned.length === 9 && cleaned.startsWith('7')) {
      return `+962${cleaned}`;
    }
    
    return `+962${cleaned}`;
  },

  /**
   * Validate Jordan phone number
   */
  validate: (phoneNumber: string): boolean => {
    // In development mode, be more lenient for testing
    if (process.env.NODE_ENV === 'development') {
      // Allow placeholder patterns like 79XXXXXXXX for testing
      const placeholderRegex = /^7[789]X{7}$/;
      if (placeholderRegex.test(phoneNumber)) return true;
      // Allow 9-digit numbers starting with 7 (Jordan format without prefix)
      const devRegex = /^7[789]\d{7}$/;
      if (devRegex.test(phoneNumber)) return true;
      // Allow 10-digit numbers starting with 0
      const devRegex2 = /^0[789]\d{7}$/;
      if (devRegex2.test(phoneNumber)) return true;
    }
    return REGEX_PATTERNS.PHONE_NUMBER.test(phoneNumber);
  },

  /**
   * Format phone number for display
   */
  format: (phoneNumber: string): string => {
    const normalized = phoneUtils.normalize(phoneNumber);
    const number = normalized.replace('+962', '');
    return `0${number.slice(0, 2)}-${number.slice(2)}`;
  },

  /**
   * Get phone number without country code for SMS
   */
  getLocalNumber: (phoneNumber: string): string => {
    const normalized = phoneUtils.normalize(phoneNumber);
    return normalized.replace('+962', '0');
  },
};

// Date utilities
export const dateUtils = {
  /**
   * Get start and end of day in UTC
   */
  getDateRange: (date: Date): { start: Date; end: Date } => {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);
    
    return { start, end };
  },

  /**
   * Get start and end of month
   */
  getMonthRange: (date: Date): { start: Date; end: Date } => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return { start, end };
  },

  /**
   * Get start and end of week (Sunday to Saturday)
   */
  getWeekRange: (date: Date): { start: Date; end: Date } => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  },

  /**
   * Check if date is valid
   */
  isValid: (date: any): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  },

  /**
   * Format date to ISO string for API
   */
  toISODate: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  /**
   * Parse ISO date string
   */
  fromISODate: (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00.000Z');
  },

  /**
   * Calculate days between two dates
   */
  daysBetween: (date1: Date, date2: Date): number => {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  },

  /**
   * Check if date is in the future
   */
  isFuture: (date: Date): boolean => {
    return date > new Date();
  },

  /**
   * Check if date is in the past
   */
  isPast: (date: Date): boolean => {
    return date < new Date();
  },

  /**
   * Add days to a date
   */
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Add months to a date
   */
  addMonths: (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },
};

// Number/Amount utilities
export const amountUtils = {
  /**
   * Format amount for display in JOD
   */
  format: (amount: number, currency = 'JOD'): string => {
    return new Intl.NumberFormat('ar-JO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Format amount as string with 2 decimal places
   */
  toFixed: (amount: number): string => {
    return amount.toFixed(2);
  },

  /**
   * Parse amount string to number
   */
  parse: (amountString: string): number => {
    const cleaned = amountString.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  },

  /**
   * Validate amount
   */
  validate: (amount: number): boolean => {
    return !isNaN(amount) && amount > 0 && amount <= 999999.99;
  },

  /**
   * Round to 2 decimal places
   */
  round: (amount: number): number => {
    return Math.round(amount * 100) / 100;
  },
};

// String utilities
export const stringUtils = {
  /**
   * Capitalize first letter
   */
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Generate random string
   */
  random: (length: number, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate random numeric string
   */
  randomNumeric: (length: number): string => {
    return stringUtils.random(length, '0123456789');
  },

  /**
   * Sanitize string for database
   */
  sanitize: (str: string): string => {
    return str.trim().replace(/\s+/g, ' ');
  },

  /**
   * Check if string is empty or only whitespace
   */
  isEmpty: (str?: string): boolean => {
    return !str || str.trim().length === 0;
  },

  /**
   * Truncate string with ellipsis
   */
  truncate: (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  },

  /**
   * Mask sensitive data (e.g., phone numbers)
   */
  mask: (str: string, visibleChars = 4): string => {
    if (str.length <= visibleChars) return str;
    const masked = '*'.repeat(str.length - visibleChars);
    return str.slice(0, visibleChars) + masked;
  },
};

// Validation utilities
export const validationUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password: string): boolean => {
    return REGEX_PATTERNS.PASSWORD.test(password);
  },

  /**
   * Validate UUID format
   */
  isValidUUID: (uuid: string): boolean => {
    return REGEX_PATTERNS.UUID.test(uuid);
  },

  /**
   * Validate OTP format
   */
  isValidOTP: (otp: string): boolean => {
    return REGEX_PATTERNS.OTP.test(otp);
  },

  /**
   * Validate amount format
   */
  isValidAmount: (amount: string): boolean => {
    return REGEX_PATTERNS.AMOUNT.test(amount);
  },

  /**
   * Validate hex color format
   */
  isValidColor: (color: string): boolean => {
    return REGEX_PATTERNS.COLOR_HEX.test(color);
  },
};

// Pagination utilities
export const paginationUtils = {
  /**
   * Calculate pagination metadata
   */
  getMeta: (page: number, limit: number, total: number) => {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    };
  },

  /**
   * Calculate skip value for database queries
   */
  getSkip: (page: number, limit: number): number => {
    return (page - 1) * limit;
  },

  /**
   * Validate pagination parameters
   */
  validate: (page: number, limit: number): { page: number; limit: number } => {
    const validPage = Math.max(1, Math.floor(page) || 1);
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit) || 20));
    
    return { page: validPage, limit: validLimit };
  },
};

// Object utilities
export const objectUtils = {
  /**
   * Deep clone an object
   */
  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Remove undefined/null values from object
   */
  clean: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const cleaned: Partial<T> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        cleaned[key as keyof T] = value;
      }
    }
    
    return cleaned;
  },

  /**
   * Pick specific keys from object
   */
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    
    return result;
  },

  /**
   * Omit specific keys from object
   */
  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    
    for (const key of keys) {
      delete result[key];
    }
    
    return result;
  },
};

// Array utilities
export const arrayUtils = {
  /**
   * Remove duplicates from array
   */
  unique: <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
  },

  /**
   * Chunk array into smaller arrays
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    
    return chunks;
  },

  /**
   * Group array by key
   */
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * Sum array of numbers
   */
  sum: (array: number[]): number => {
    return array.reduce((sum, num) => sum + num, 0);
  },

  /**
   * Get average of array
   */
  average: (array: number[]): number => {
    return array.length ? arrayUtils.sum(array) / array.length : 0;
  },
};

// Cache key utilities
export const cacheUtils = {
  /**
   * Generate cache key
   */
  key: (prefix: string, ...parts: (string | number)[]): string => {
    return `${prefix}${parts.join(':')}`;
  },

  /**
   * Generate user-specific cache key
   */
  userKey: (userId: string, prefix: string, ...parts: (string | number)[]): string => {
    return cacheUtils.key(prefix, userId, ...parts);
  },
};

// Error utilities
export const errorUtils = {
  /**
   * Check if error is operational (expected) error
   */
  isOperational: (error: any): boolean => {
    return error?.isOperational === true;
  },

  /**
   * Extract error message safely
   */
  getMessage: (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'Unknown error occurred';
  },

  /**
   * Sanitize error for logging (remove sensitive data)
   */
  sanitize: (error: any): any => {
    if (typeof error === 'string') return error;
    
    const sanitized = { ...error };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  },
};

// Template utilities for notifications
export const templateUtils = {
  /**
   * Replace placeholders in template string
   */
  render: (template: string, variables: Record<string, any>): string => {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  },
};

// Sleep utility for testing/development
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry utility for external API calls
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError;
};