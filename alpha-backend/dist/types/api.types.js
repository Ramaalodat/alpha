"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobTypes = exports.CacheKeys = exports.createSuccessResponse = exports.createErrorResponse = exports.createApiResponse = exports.ErrorStatusMap = exports.ErrorCodes = void 0;
// Error code constants
var ErrorCodes;
(function (ErrorCodes) {
    // Validation Errors
    ErrorCodes["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCodes["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCodes["REQUIRED_FIELD_MISSING"] = "REQUIRED_FIELD_MISSING";
    // Authentication Errors
    ErrorCodes["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCodes["INVALID_TOKEN"] = "INVALID_TOKEN";
    ErrorCodes["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCodes["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCodes["ACCOUNT_NOT_VERIFIED"] = "ACCOUNT_NOT_VERIFIED";
    ErrorCodes["ACCOUNT_SUSPENDED"] = "ACCOUNT_SUSPENDED";
    // Authorization Errors
    ErrorCodes["FORBIDDEN"] = "FORBIDDEN";
    ErrorCodes["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    // Resource Errors
    ErrorCodes["NOT_FOUND"] = "NOT_FOUND";
    ErrorCodes["RESOURCE_EXISTS"] = "RESOURCE_EXISTS";
    ErrorCodes["CONFLICT"] = "CONFLICT";
    // Rate Limiting
    ErrorCodes["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCodes["TOO_MANY_REQUESTS"] = "TOO_MANY_REQUESTS";
    // OTP Errors
    ErrorCodes["OTP_EXPIRED"] = "OTP_EXPIRED";
    ErrorCodes["OTP_INVALID"] = "OTP_INVALID";
    ErrorCodes["OTP_ALREADY_USED"] = "OTP_ALREADY_USED";
    ErrorCodes["OTP_MAX_ATTEMPTS_EXCEEDED"] = "OTP_MAX_ATTEMPTS_EXCEEDED";
    ErrorCodes["OTP_RATE_LIMIT_EXCEEDED"] = "OTP_RATE_LIMIT_EXCEEDED";
    // Business Logic Errors
    ErrorCodes["ONBOARDING_INCOMPLETE"] = "ONBOARDING_INCOMPLETE";
    ErrorCodes["ONBOARDING_ALREADY_COMPLETE"] = "ONBOARDING_ALREADY_COMPLETE";
    ErrorCodes["INSUFFICIENT_BALANCE"] = "INSUFFICIENT_BALANCE";
    ErrorCodes["GOAL_NOT_ACTIVE"] = "GOAL_NOT_ACTIVE";
    ErrorCodes["INVALID_AMOUNT"] = "INVALID_AMOUNT";
    ErrorCodes["INVALID_DATE_RANGE"] = "INVALID_DATE_RANGE";
    // System Errors
    ErrorCodes["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCodes["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCodes["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorCodes["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    // Phone/SMS Errors
    ErrorCodes["INVALID_PHONE_NUMBER"] = "INVALID_PHONE_NUMBER";
    ErrorCodes["SMS_SEND_FAILED"] = "SMS_SEND_FAILED";
    ErrorCodes["PHONE_NUMBER_EXISTS"] = "PHONE_NUMBER_EXISTS";
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
// HTTP Status Codes mapping
exports.ErrorStatusMap = {
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
const createApiResponse = (success, data, message, error, pagination) => {
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
exports.createApiResponse = createApiResponse;
// Helper function to create error responses
const createErrorResponse = (code, message, details, field) => {
    return (0, exports.createApiResponse)(false, null, undefined, {
        code,
        message,
        details,
        field,
        ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack }),
    });
};
exports.createErrorResponse = createErrorResponse;
// Helper function to create success responses
const createSuccessResponse = (data, message, pagination) => {
    return (0, exports.createApiResponse)(true, data, message, undefined, pagination);
};
exports.createSuccessResponse = createSuccessResponse;
// Cache keys
var CacheKeys;
(function (CacheKeys) {
    CacheKeys["USER_PROFILE"] = "user:profile:";
    CacheKeys["USER_GOALS"] = "user:goals:";
    CacheKeys["USER_EXPENSES"] = "user:expenses:";
    CacheKeys["EXPENSE_CATEGORIES"] = "expense:categories";
    CacheKeys["OTP_ATTEMPTS"] = "otp:attempts:";
    CacheKeys["RATE_LIMIT"] = "rate:limit:";
    CacheKeys["SESSION"] = "session:";
})(CacheKeys || (exports.CacheKeys = CacheKeys = {}));
var JobTypes;
(function (JobTypes) {
    JobTypes["SEND_NOTIFICATION"] = "send_notification";
    JobTypes["GENERATE_AI_INSIGHTS"] = "generate_ai_insights";
    JobTypes["CALCULATE_ANALYTICS"] = "calculate_analytics";
    JobTypes["CLEANUP_EXPIRED_OTPS"] = "cleanup_expired_otps";
    JobTypes["SEND_WEEKLY_SUMMARY"] = "send_weekly_summary";
    JobTypes["BACKUP_DATA"] = "backup_data";
})(JobTypes || (exports.JobTypes = JobTypes = {}));
//# sourceMappingURL=api.types.js.map