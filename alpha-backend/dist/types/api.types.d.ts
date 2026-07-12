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
    field?: string;
    stack?: string;
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
export declare enum ErrorCodes {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INVALID_INPUT = "INVALID_INPUT",
    REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING",
    UNAUTHORIZED = "UNAUTHORIZED",
    INVALID_TOKEN = "INVALID_TOKEN",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    ACCOUNT_NOT_VERIFIED = "ACCOUNT_NOT_VERIFIED",
    ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED",
    FORBIDDEN = "FORBIDDEN",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    NOT_FOUND = "NOT_FOUND",
    RESOURCE_EXISTS = "RESOURCE_EXISTS",
    CONFLICT = "CONFLICT",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
    OTP_EXPIRED = "OTP_EXPIRED",
    OTP_INVALID = "OTP_INVALID",
    OTP_ALREADY_USED = "OTP_ALREADY_USED",
    OTP_MAX_ATTEMPTS_EXCEEDED = "OTP_MAX_ATTEMPTS_EXCEEDED",
    OTP_RATE_LIMIT_EXCEEDED = "OTP_RATE_LIMIT_EXCEEDED",
    ONBOARDING_INCOMPLETE = "ONBOARDING_INCOMPLETE",
    ONBOARDING_ALREADY_COMPLETE = "ONBOARDING_ALREADY_COMPLETE",
    INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
    GOAL_NOT_ACTIVE = "GOAL_NOT_ACTIVE",
    INVALID_AMOUNT = "INVALID_AMOUNT",
    INVALID_DATE_RANGE = "INVALID_DATE_RANGE",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER",
    SMS_SEND_FAILED = "SMS_SEND_FAILED",
    PHONE_NUMBER_EXISTS = "PHONE_NUMBER_EXISTS"
}
export declare const ErrorStatusMap: Record<ErrorCodes, number>;
export declare const createApiResponse: <T>(success: boolean, data?: T, message?: string, error?: ApiError, pagination?: PaginationMeta) => ApiResponse<T>;
export declare const createErrorResponse: (code: ErrorCodes, message: string, details?: Record<string, any>, field?: string) => ApiResponse;
export declare const createSuccessResponse: <T>(data: T, message?: string, pagination?: PaginationMeta) => ApiResponse<T>;
export interface DateRangeFilter {
    startDate?: string;
    endDate?: string;
}
export interface AmountRangeFilter {
    minAmount?: number;
    maxAmount?: number;
}
export interface BaseQueryParams extends PaginationRequest {
    search?: string;
    filter?: Record<string, any>;
    include?: string[];
}
export interface FileUploadResult {
    id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: string;
}
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
export interface NotificationPayload {
    title: string;
    message: string;
    data?: Record<string, any>;
    type: 'push' | 'sms' | 'email';
    priority?: 'low' | 'medium' | 'high';
}
export declare enum CacheKeys {
    USER_PROFILE = "user:profile:",
    USER_GOALS = "user:goals:",
    USER_EXPENSES = "user:expenses:",
    EXPENSE_CATEGORIES = "expense:categories",
    OTP_ATTEMPTS = "otp:attempts:",
    RATE_LIMIT = "rate:limit:",
    SESSION = "session:"
}
export interface JobData {
    id: string;
    type: string;
    payload: Record<string, any>;
    userId?: string;
    scheduledAt?: Date;
    attempts?: number;
}
export declare enum JobTypes {
    SEND_NOTIFICATION = "send_notification",
    GENERATE_AI_INSIGHTS = "generate_ai_insights",
    CALCULATE_ANALYTICS = "calculate_analytics",
    CLEANUP_EXPIRED_OTPS = "cleanup_expired_otps",
    SEND_WEEKLY_SUMMARY = "send_weekly_summary",
    BACKUP_DATA = "backup_data"
}
//# sourceMappingURL=api.types.d.ts.map