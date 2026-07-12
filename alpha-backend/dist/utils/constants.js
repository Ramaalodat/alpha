"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.REGEX_PATTERNS = exports.ERROR_MESSAGES = exports.SUCCESS_MESSAGES = exports.VALIDATION_MESSAGES = exports.TIMEOUTS = exports.JOB_PRIORITY = exports.CACHE_TTL = exports.ANALYTICS_PERIODS = exports.ARABIC_DAYS = exports.ARABIC_MONTHS = exports.NOTIFICATION_TEMPLATES = exports.GOAL_ICONS = exports.DEFAULT_EXPENSE_CATEGORIES = exports.FILE_CONFIG = exports.CURRENCY_CONFIG = exports.DATE_FORMATS = exports.PAGINATION = exports.RATE_LIMITS = exports.JWT_CONFIG = exports.OTP_CONFIG = exports.PASSWORD_CONFIG = exports.PHONE_CONFIG = exports.APP_CONFIG = void 0;
// Application constants
exports.APP_CONFIG = {
    NAME: 'BASIRA',
    VERSION: '1.0.0',
    DESCRIPTION: 'Your Resilient Partner in Financial Growth',
    AUTHOR: 'Team Alpha',
};
// Phone number validation
exports.PHONE_CONFIG = {
    JORDAN_PREFIX: '+962',
    LOCAL_PREFIXES: ['07', '079', '077', '078'],
    MIN_LENGTH: 9,
    MAX_LENGTH: 10,
    REGEX: /^(\+962|0)?(7[789]\d{7})$/,
};
// Password validation
exports.PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};
// OTP configuration
exports.OTP_CONFIG = {
    LENGTH: 6,
    EXPIRY_MINUTES: 5,
    MAX_ATTEMPTS: 3,
    RATE_LIMIT_WINDOW_MINUTES: 15,
    DAILY_LIMIT: 10,
    BLOCKED_DURATION_MINUTES: 60,
};
// JWT configuration
exports.JWT_CONFIG = {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    ISSUER: 'basira-api',
    AUDIENCE: 'basira-app',
};
// Rate limiting
exports.RATE_LIMITS = {
    GENERAL: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 100,
    },
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 5,
    },
    OTP: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 3,
    },
    SENSITIVE: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 10,
    },
};
// Pagination defaults
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
};
// Date formats
exports.DATE_FORMATS = {
    ISO: 'YYYY-MM-DD',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};
// Currency configuration (Jordan)
exports.CURRENCY_CONFIG = {
    CODE: 'JOD',
    SYMBOL: 'د.أ',
    DECIMAL_PLACES: 2,
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 999999.99,
};
// File upload configuration
exports.FILE_CONFIG = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
        IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
        DOCUMENTS: ['application/pdf'],
    },
    UPLOAD_PATH: 'uploads/',
    TEMP_PATH: 'temp/',
};
// Default expense categories
exports.DEFAULT_EXPENSE_CATEGORIES = [
    { name: 'Food & Dining', icon: '🍽️', color: '#EF4444' },
    { name: 'Transportation', icon: '🚗', color: '#3B82F6' },
    { name: 'Shopping', icon: '🛍️', color: '#8B5CF6' },
    { name: 'Entertainment', icon: '🎬', color: '#10B981' },
    { name: 'Bills & Utilities', icon: '⚡', color: '#F59E0B' },
    { name: 'Healthcare', icon: '🏥', color: '#EC4899' },
    { name: 'Education', icon: '📚', color: '#6366F1' },
    { name: 'Travel', icon: '✈️', color: '#14B8A6' },
    { name: 'Personal Care', icon: '💄', color: '#F97316' },
    { name: 'Gifts & Donations', icon: '🎁', color: '#84CC16' },
    { name: 'Savings', icon: '💰', color: '#22C55E' },
    { name: 'Other', icon: '📝', color: '#6B7280' },
];
// Goal icons
exports.GOAL_ICONS = [
    '🏠', '🚗', '✈️', '💍', '📚', '💰', '🎓', '💻',
    '📱', '🏖️', '🍽️', '👕', '⚽', '🎮', '🎸', '📷',
    '🏥', '🏦', '🏢', '🌟', '🎯', '💎', '🏆', '🎊',
];
// Notification templates
exports.NOTIFICATION_TEMPLATES = {
    GOAL_MILESTONE: {
        '25': {
            title: 'تهانينا! وصلت إلى 25% من هدفك',
            message: 'لقد حققت ربع المسافة نحو {goalName}. استمر في الادخار!',
        },
        '50': {
            title: 'رائع! وصلت إلى نصف الطريق',
            message: 'وصلت إلى 50% من هدف {goalName}. أنت في الطريق الصحيح!',
        },
        '75': {
            title: 'ممتاز! تقريباً وصلت للهدف',
            message: 'وصلت إلى 75% من هدف {goalName}. الهدف قريب جداً!',
        },
        '100': {
            title: 'مبروك! حققت هدفك',
            message: 'تهانينا! لقد حققت هدف {goalName} بنجاح. حان الوقت لهدف جديد!',
        },
    },
    SPENDING_ALERT: {
        '80': {
            title: 'تنبيه: اقتربت من حد الإنفاق',
            message: 'لقد أنفقت 80% من ميزانيتك الشهرية. انتبه للإنفاق المتبقي.',
        },
        '100': {
            title: 'تحذير: تجاوزت حد الإنفاق',
            message: 'لقد تجاوزت ميزانيتك الشهرية. راجع نفقاتك وخطط للشهر القادم.',
        },
    },
};
// Arabic month names
exports.ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];
// Arabic day names
exports.ARABIC_DAYS = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء',
    'الخميس', 'الجمعة', 'السبت'
];
// Analytics periods
exports.ANALYTICS_PERIODS = {
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year',
};
// Cache TTL (Time To Live) in seconds
exports.CACHE_TTL = {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes  
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
};
// Background job priorities
exports.JOB_PRIORITY = {
    HIGH: 1,
    MEDIUM: 5,
    LOW: 10,
};
// API timeouts (in milliseconds)
exports.TIMEOUTS = {
    DATABASE: 30000, // 30 seconds
    EXTERNAL_API: 10000, // 10 seconds
    SMS_SERVICE: 15000, // 15 seconds
    FILE_UPLOAD: 60000, // 1 minute
};
// Validation messages (Arabic)
exports.VALIDATION_MESSAGES = {
    REQUIRED: 'هذا الحقل مطلوب',
    INVALID_EMAIL: 'عنوان البريد الإلكتروني غير صحيح',
    INVALID_PHONE: 'رقم الهاتف غير صحيح',
    WEAK_PASSWORD: 'كلمة المرور ضعيفة. يجب أن تحتوي على 8 أحرف على الأقل مع أرقام وحروف كبيرة وصغيرة',
    INVALID_DATE: 'التاريخ غير صحيح',
    INVALID_AMOUNT: 'المبلغ غير صحيح',
    MIN_LENGTH: 'الطول الأدنى {min} أحرف',
    MAX_LENGTH: 'الطول الأقصى {max} حرف',
    MIN_VALUE: 'القيمة الدنيا {min}',
    MAX_VALUE: 'القيمة العليا {max}',
};
// Success messages (Arabic)
exports.SUCCESS_MESSAGES = {
    USER_REGISTERED: 'تم تسجيل المستخدم بنجاح',
    OTP_SENT: 'تم إرسال رمز التحقق إلى هاتفك',
    ACCOUNT_VERIFIED: 'تم تفعيل الحساب بنجاح',
    LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
    PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
    GOAL_CREATED: 'تم إنشاء الهدف المالي بنجاح',
    GOAL_UPDATED: 'تم تحديث الهدف المالي بنجاح',
    GOAL_DELETED: 'تم حذف الهدف المالي بنجاح',
    EXPENSE_CREATED: 'تم إضافة المصروف بنجاح',
    EXPENSE_UPDATED: 'تم تحديث المصروف بنجاح',
    EXPENSE_DELETED: 'تم حذف المصروف بنجاح',
    TRANSACTION_ADDED: 'تم إضافة المعاملة بنجاح',
    NOTIFICATION_READ: 'تم قراءة الإشعار',
    INSIGHT_READ: 'تم قراءة النصيحة',
};
// Error messages (Arabic)
exports.ERROR_MESSAGES = {
    PHONE_EXISTS: 'رقم الهاتف مستخدم مسبقاً',
    INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
    ACCOUNT_NOT_VERIFIED: 'الحساب غير مفعل. يرجى التحقق من رقم الهاتف',
    ACCOUNT_SUSPENDED: 'الحساب معلق. يرجى التواصل مع الدعم',
    OTP_EXPIRED: 'انتهت صلاحية رمز التحقق',
    OTP_INVALID: 'رمز التحقق غير صحيح',
    OTP_MAX_ATTEMPTS: 'تم تجاوز الحد الأقصى لمحاولات رمز التحقق',
    ONBOARDING_INCOMPLETE: 'يرجى إكمال عملية التسجيل',
    ONBOARDING_COMPLETE: 'تم إكمال عملية التسجيل مسبقاً',
    GOAL_NOT_FOUND: 'الهدف المالي غير موجود',
    EXPENSE_NOT_FOUND: 'المصروف غير موجود',
    INSUFFICIENT_BALANCE: 'الرصيد غير كافي',
    INVALID_AMOUNT: 'المبلغ غير صحيح',
    RATE_LIMIT_EXCEEDED: 'تم تجاوز الحد المسموح من الطلبات. حاول مرة أخرى لاحقاً',
    INTERNAL_ERROR: 'حدث خطأ في النظام. يرجى المحاولة مرة أخرى',
    SERVICE_UNAVAILABLE: 'الخدمة غير متاحة حالياً',
};
// Regex patterns
exports.REGEX_PATTERNS = {
    PHONE_NUMBER: /^(\+962|962|0)?(7[789]\d{7})$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    OTP: /^\d{6}$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    AMOUNT: /^\d+(\.\d{1,2})?$/,
    COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
};
// HTTP status codes
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
};
//# sourceMappingURL=constants.js.map