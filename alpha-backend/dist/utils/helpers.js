"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = exports.sleep = exports.templateUtils = exports.errorUtils = exports.cacheUtils = exports.arrayUtils = exports.objectUtils = exports.paginationUtils = exports.validationUtils = exports.stringUtils = exports.amountUtils = exports.dateUtils = exports.phoneUtils = void 0;
const constants_1 = require("./constants");
// Phone number utilities
exports.phoneUtils = {
    /**
     * Normalize Jordan phone number to standard format (+962XXXXXXXXX)
     */
    normalize: (phoneNumber) => {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        // Handle different formats
        if (cleaned.startsWith('962')) {
            return `+${cleaned}`;
        }
        else if (cleaned.startsWith('0')) {
            return `+962${cleaned.slice(1)}`;
        }
        else if (cleaned.length === 9 && cleaned.startsWith('7')) {
            return `+962${cleaned}`;
        }
        return `+962${cleaned}`;
    },
    /**
     * Validate Jordan phone number
     */
    validate: (phoneNumber) => {
        return constants_1.REGEX_PATTERNS.PHONE_NUMBER.test(phoneNumber);
    },
    /**
     * Format phone number for display
     */
    format: (phoneNumber) => {
        const normalized = exports.phoneUtils.normalize(phoneNumber);
        const number = normalized.replace('+962', '');
        return `0${number.slice(0, 2)}-${number.slice(2)}`;
    },
    /**
     * Get phone number without country code for SMS
     */
    getLocalNumber: (phoneNumber) => {
        const normalized = exports.phoneUtils.normalize(phoneNumber);
        return normalized.replace('+962', '0');
    },
};
// Date utilities
exports.dateUtils = {
    /**
     * Get start and end of day in UTC
     */
    getDateRange: (date) => {
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);
        return { start, end };
    },
    /**
     * Get start and end of month
     */
    getMonthRange: (date) => {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start, end };
    },
    /**
     * Get start and end of week (Sunday to Saturday)
     */
    getWeekRange: (date) => {
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
    isValid: (date) => {
        return date instanceof Date && !isNaN(date.getTime());
    },
    /**
     * Format date to ISO string for API
     */
    toISODate: (date) => {
        return date.toISOString().split('T')[0];
    },
    /**
     * Parse ISO date string
     */
    fromISODate: (dateString) => {
        return new Date(dateString + 'T00:00:00.000Z');
    },
    /**
     * Calculate days between two dates
     */
    daysBetween: (date1, date2) => {
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    },
    /**
     * Check if date is in the future
     */
    isFuture: (date) => {
        return date > new Date();
    },
    /**
     * Check if date is in the past
     */
    isPast: (date) => {
        return date < new Date();
    },
    /**
     * Add days to a date
     */
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    /**
     * Add months to a date
     */
    addMonths: (date, months) => {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    },
};
// Number/Amount utilities
exports.amountUtils = {
    /**
     * Format amount for display in JOD
     */
    format: (amount, currency = 'JOD') => {
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
    toFixed: (amount) => {
        return amount.toFixed(2);
    },
    /**
     * Parse amount string to number
     */
    parse: (amountString) => {
        const cleaned = amountString.replace(/[^\d.-]/g, '');
        return parseFloat(cleaned) || 0;
    },
    /**
     * Validate amount
     */
    validate: (amount) => {
        return !isNaN(amount) && amount > 0 && amount <= 999999.99;
    },
    /**
     * Round to 2 decimal places
     */
    round: (amount) => {
        return Math.round(amount * 100) / 100;
    },
};
// String utilities
exports.stringUtils = {
    /**
     * Capitalize first letter
     */
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    /**
     * Generate random string
     */
    random: (length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    /**
     * Generate random numeric string
     */
    randomNumeric: (length) => {
        return exports.stringUtils.random(length, '0123456789');
    },
    /**
     * Sanitize string for database
     */
    sanitize: (str) => {
        return str.trim().replace(/\s+/g, ' ');
    },
    /**
     * Check if string is empty or only whitespace
     */
    isEmpty: (str) => {
        return !str || str.trim().length === 0;
    },
    /**
     * Truncate string with ellipsis
     */
    truncate: (str, maxLength) => {
        if (str.length <= maxLength)
            return str;
        return str.slice(0, maxLength - 3) + '...';
    },
    /**
     * Mask sensitive data (e.g., phone numbers)
     */
    mask: (str, visibleChars = 4) => {
        if (str.length <= visibleChars)
            return str;
        const masked = '*'.repeat(str.length - visibleChars);
        return str.slice(0, visibleChars) + masked;
    },
};
// Validation utilities
exports.validationUtils = {
    /**
     * Validate email format
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    /**
     * Validate password strength
     */
    isValidPassword: (password) => {
        return constants_1.REGEX_PATTERNS.PASSWORD.test(password);
    },
    /**
     * Validate UUID format
     */
    isValidUUID: (uuid) => {
        return constants_1.REGEX_PATTERNS.UUID.test(uuid);
    },
    /**
     * Validate OTP format
     */
    isValidOTP: (otp) => {
        return constants_1.REGEX_PATTERNS.OTP.test(otp);
    },
    /**
     * Validate amount format
     */
    isValidAmount: (amount) => {
        return constants_1.REGEX_PATTERNS.AMOUNT.test(amount);
    },
    /**
     * Validate hex color format
     */
    isValidColor: (color) => {
        return constants_1.REGEX_PATTERNS.COLOR_HEX.test(color);
    },
};
// Pagination utilities
exports.paginationUtils = {
    /**
     * Calculate pagination metadata
     */
    getMeta: (page, limit, total) => {
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
    getSkip: (page, limit) => {
        return (page - 1) * limit;
    },
    /**
     * Validate pagination parameters
     */
    validate: (page, limit) => {
        const validPage = Math.max(1, Math.floor(page) || 1);
        const validLimit = Math.min(100, Math.max(1, Math.floor(limit) || 20));
        return { page: validPage, limit: validLimit };
    },
};
// Object utilities
exports.objectUtils = {
    /**
     * Deep clone an object
     */
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },
    /**
     * Remove undefined/null values from object
     */
    clean: (obj) => {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined && value !== null) {
                cleaned[key] = value;
            }
        }
        return cleaned;
    },
    /**
     * Pick specific keys from object
     */
    pick: (obj, keys) => {
        const result = {};
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
    omit: (obj, keys) => {
        const result = { ...obj };
        for (const key of keys) {
            delete result[key];
        }
        return result;
    },
};
// Array utilities
exports.arrayUtils = {
    /**
     * Remove duplicates from array
     */
    unique: (array) => {
        return Array.from(new Set(array));
    },
    /**
     * Chunk array into smaller arrays
     */
    chunk: (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },
    /**
     * Group array by key
     */
    groupBy: (array, key) => {
        return array.reduce((groups, item) => {
            const group = String(item[key]);
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    },
    /**
     * Sum array of numbers
     */
    sum: (array) => {
        return array.reduce((sum, num) => sum + num, 0);
    },
    /**
     * Get average of array
     */
    average: (array) => {
        return array.length ? exports.arrayUtils.sum(array) / array.length : 0;
    },
};
// Cache key utilities
exports.cacheUtils = {
    /**
     * Generate cache key
     */
    key: (prefix, ...parts) => {
        return `${prefix}${parts.join(':')}`;
    },
    /**
     * Generate user-specific cache key
     */
    userKey: (userId, prefix, ...parts) => {
        return exports.cacheUtils.key(prefix, userId, ...parts);
    },
};
// Error utilities
exports.errorUtils = {
    /**
     * Check if error is operational (expected) error
     */
    isOperational: (error) => {
        return error?.isOperational === true;
    },
    /**
     * Extract error message safely
     */
    getMessage: (error) => {
        if (typeof error === 'string')
            return error;
        if (error?.message)
            return error.message;
        if (error?.error?.message)
            return error.error.message;
        return 'Unknown error occurred';
    },
    /**
     * Sanitize error for logging (remove sensitive data)
     */
    sanitize: (error) => {
        if (typeof error === 'string')
            return error;
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
exports.templateUtils = {
    /**
     * Replace placeholders in template string
     */
    render: (template, variables) => {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return variables[key] !== undefined ? String(variables[key]) : match;
        });
    },
};
// Sleep utility for testing/development
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
// Retry utility for external API calls
const retry = async (fn, maxAttempts = 3, delayMs = 1000) => {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                await (0, exports.sleep)(delayMs * attempt); // Exponential backoff
            }
        }
    }
    throw lastError;
};
exports.retry = retry;
//# sourceMappingURL=helpers.js.map