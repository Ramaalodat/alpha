export declare const phoneUtils: {
    /**
     * Normalize Jordan phone number to standard format (+962XXXXXXXXX)
     */
    normalize: (phoneNumber: string) => string;
    /**
     * Validate Jordan phone number
     */
    validate: (phoneNumber: string) => boolean;
    /**
     * Format phone number for display
     */
    format: (phoneNumber: string) => string;
    /**
     * Get phone number without country code for SMS
     */
    getLocalNumber: (phoneNumber: string) => string;
};
export declare const dateUtils: {
    /**
     * Get start and end of day in UTC
     */
    getDateRange: (date: Date) => {
        start: Date;
        end: Date;
    };
    /**
     * Get start and end of month
     */
    getMonthRange: (date: Date) => {
        start: Date;
        end: Date;
    };
    /**
     * Get start and end of week (Sunday to Saturday)
     */
    getWeekRange: (date: Date) => {
        start: Date;
        end: Date;
    };
    /**
     * Check if date is valid
     */
    isValid: (date: any) => date is Date;
    /**
     * Format date to ISO string for API
     */
    toISODate: (date: Date) => string;
    /**
     * Parse ISO date string
     */
    fromISODate: (dateString: string) => Date;
    /**
     * Calculate days between two dates
     */
    daysBetween: (date1: Date, date2: Date) => number;
    /**
     * Check if date is in the future
     */
    isFuture: (date: Date) => boolean;
    /**
     * Check if date is in the past
     */
    isPast: (date: Date) => boolean;
    /**
     * Add days to a date
     */
    addDays: (date: Date, days: number) => Date;
    /**
     * Add months to a date
     */
    addMonths: (date: Date, months: number) => Date;
};
export declare const amountUtils: {
    /**
     * Format amount for display in JOD
     */
    format: (amount: number, currency?: string) => string;
    /**
     * Format amount as string with 2 decimal places
     */
    toFixed: (amount: number) => string;
    /**
     * Parse amount string to number
     */
    parse: (amountString: string) => number;
    /**
     * Validate amount
     */
    validate: (amount: number) => boolean;
    /**
     * Round to 2 decimal places
     */
    round: (amount: number) => number;
};
export declare const stringUtils: {
    /**
     * Capitalize first letter
     */
    capitalize: (str: string) => string;
    /**
     * Generate random string
     */
    random: (length: number, chars?: string) => string;
    /**
     * Generate random numeric string
     */
    randomNumeric: (length: number) => string;
    /**
     * Sanitize string for database
     */
    sanitize: (str: string) => string;
    /**
     * Check if string is empty or only whitespace
     */
    isEmpty: (str?: string) => boolean;
    /**
     * Truncate string with ellipsis
     */
    truncate: (str: string, maxLength: number) => string;
    /**
     * Mask sensitive data (e.g., phone numbers)
     */
    mask: (str: string, visibleChars?: number) => string;
};
export declare const validationUtils: {
    /**
     * Validate email format
     */
    isValidEmail: (email: string) => boolean;
    /**
     * Validate password strength
     */
    isValidPassword: (password: string) => boolean;
    /**
     * Validate UUID format
     */
    isValidUUID: (uuid: string) => boolean;
    /**
     * Validate OTP format
     */
    isValidOTP: (otp: string) => boolean;
    /**
     * Validate amount format
     */
    isValidAmount: (amount: string) => boolean;
    /**
     * Validate hex color format
     */
    isValidColor: (color: string) => boolean;
};
export declare const paginationUtils: {
    /**
     * Calculate pagination metadata
     */
    getMeta: (page: number, limit: number, total: number) => {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    /**
     * Calculate skip value for database queries
     */
    getSkip: (page: number, limit: number) => number;
    /**
     * Validate pagination parameters
     */
    validate: (page: number, limit: number) => {
        page: number;
        limit: number;
    };
};
export declare const objectUtils: {
    /**
     * Deep clone an object
     */
    deepClone: <T>(obj: T) => T;
    /**
     * Remove undefined/null values from object
     */
    clean: <T extends Record<string, any>>(obj: T) => Partial<T>;
    /**
     * Pick specific keys from object
     */
    pick: <T, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;
    /**
     * Omit specific keys from object
     */
    omit: <T, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>;
};
export declare const arrayUtils: {
    /**
     * Remove duplicates from array
     */
    unique: <T>(array: T[]) => T[];
    /**
     * Chunk array into smaller arrays
     */
    chunk: <T>(array: T[], size: number) => T[][];
    /**
     * Group array by key
     */
    groupBy: <T, K extends keyof T>(array: T[], key: K) => Record<string, T[]>;
    /**
     * Sum array of numbers
     */
    sum: (array: number[]) => number;
    /**
     * Get average of array
     */
    average: (array: number[]) => number;
};
export declare const cacheUtils: {
    /**
     * Generate cache key
     */
    key: (prefix: string, ...parts: (string | number)[]) => string;
    /**
     * Generate user-specific cache key
     */
    userKey: (userId: string, prefix: string, ...parts: (string | number)[]) => string;
};
export declare const errorUtils: {
    /**
     * Check if error is operational (expected) error
     */
    isOperational: (error: any) => boolean;
    /**
     * Extract error message safely
     */
    getMessage: (error: any) => string;
    /**
     * Sanitize error for logging (remove sensitive data)
     */
    sanitize: (error: any) => any;
};
export declare const templateUtils: {
    /**
     * Replace placeholders in template string
     */
    render: (template: string, variables: Record<string, any>) => string;
};
export declare const sleep: (ms: number) => Promise<void>;
export declare const retry: <T>(fn: () => Promise<T>, maxAttempts?: number, delayMs?: number) => Promise<T>;
//# sourceMappingURL=helpers.d.ts.map