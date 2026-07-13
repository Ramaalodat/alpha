export declare const APP_CONFIG: {
    readonly NAME: "BASIRA";
    readonly VERSION: "1.0.0";
    readonly DESCRIPTION: "Your Resilient Partner in Financial Growth";
    readonly AUTHOR: "Team Alpha";
};
export declare const PHONE_CONFIG: {
    readonly JORDAN_PREFIX: "+962";
    readonly LOCAL_PREFIXES: readonly ["07", "079", "077", "078"];
    readonly MIN_LENGTH: 9;
    readonly MAX_LENGTH: 10;
    readonly REGEX: RegExp;
};
export declare const PASSWORD_CONFIG: {
    readonly MIN_LENGTH: 8;
    readonly MAX_LENGTH: 128;
    readonly REQUIRE_UPPERCASE: true;
    readonly REQUIRE_LOWERCASE: true;
    readonly REQUIRE_NUMBERS: true;
    readonly REQUIRE_SYMBOLS: false;
    readonly REGEX: RegExp;
};
export declare const OTP_CONFIG: {
    readonly LENGTH: 6;
    readonly EXPIRY_MINUTES: 5;
    readonly MAX_ATTEMPTS: 3;
    readonly RATE_LIMIT_WINDOW_MINUTES: 15;
    readonly DAILY_LIMIT: 10;
    readonly BLOCKED_DURATION_MINUTES: 60;
};
export declare const JWT_CONFIG: {
    readonly ACCESS_TOKEN_EXPIRY: "15m";
    readonly REFRESH_TOKEN_EXPIRY: "7d";
    readonly ISSUER: "basira-api";
    readonly AUDIENCE: "basira-app";
};
export declare const RATE_LIMITS: {
    readonly GENERAL: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 100;
    };
    readonly AUTH: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 5;
    };
    readonly OTP: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 3;
    };
    readonly SENSITIVE: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 10;
    };
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
    readonly MIN_LIMIT: 1;
};
export declare const DATE_FORMATS: {
    readonly ISO: "YYYY-MM-DD";
    readonly DATETIME: "YYYY-MM-DD HH:mm:ss";
    readonly DISPLAY: "DD/MM/YYYY";
    readonly API: "YYYY-MM-DDTHH:mm:ss.SSSZ";
};
export declare const CURRENCY_CONFIG: {
    readonly CODE: "JOD";
    readonly SYMBOL: "د.أ";
    readonly DECIMAL_PLACES: 2;
    readonly MIN_AMOUNT: 0.01;
    readonly MAX_AMOUNT: 999999.99;
};
export declare const FILE_CONFIG: {
    readonly MAX_SIZE: number;
    readonly ALLOWED_TYPES: {
        readonly IMAGES: readonly ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        readonly DOCUMENTS: readonly ["application/pdf"];
    };
    readonly UPLOAD_PATH: "uploads/";
    readonly TEMP_PATH: "temp/";
};
export declare const DEFAULT_EXPENSE_CATEGORIES: readonly [{
    readonly name: "Food & Dining";
    readonly icon: "🍽️";
    readonly color: "#EF4444";
}, {
    readonly name: "Transportation";
    readonly icon: "🚗";
    readonly color: "#3B82F6";
}, {
    readonly name: "Shopping";
    readonly icon: "🛍️";
    readonly color: "#8B5CF6";
}, {
    readonly name: "Entertainment";
    readonly icon: "🎬";
    readonly color: "#10B981";
}, {
    readonly name: "Bills & Utilities";
    readonly icon: "⚡";
    readonly color: "#F59E0B";
}, {
    readonly name: "Healthcare";
    readonly icon: "🏥";
    readonly color: "#EC4899";
}, {
    readonly name: "Education";
    readonly icon: "📚";
    readonly color: "#6366F1";
}, {
    readonly name: "Travel";
    readonly icon: "✈️";
    readonly color: "#14B8A6";
}, {
    readonly name: "Personal Care";
    readonly icon: "💄";
    readonly color: "#F97316";
}, {
    readonly name: "Gifts & Donations";
    readonly icon: "🎁";
    readonly color: "#84CC16";
}, {
    readonly name: "Savings";
    readonly icon: "💰";
    readonly color: "#22C55E";
}, {
    readonly name: "Other";
    readonly icon: "📝";
    readonly color: "#6B7280";
}];
export declare const GOAL_ICONS: readonly ["🏠", "🚗", "✈️", "💍", "📚", "💰", "🎓", "💻", "📱", "🏖️", "🍽️", "👕", "⚽", "🎮", "🎸", "📷", "🏥", "🏦", "🏢", "🌟", "🎯", "💎", "🏆", "🎊"];
export declare const NOTIFICATION_TEMPLATES: {
    readonly GOAL_MILESTONE: {
        readonly '25': {
            readonly title: "تهانينا! وصلت إلى 25% من هدفك";
            readonly message: "لقد حققت ربع المسافة نحو {goalName}. استمر في الادخار!";
        };
        readonly '50': {
            readonly title: "رائع! وصلت إلى نصف الطريق";
            readonly message: "وصلت إلى 50% من هدف {goalName}. أنت في الطريق الصحيح!";
        };
        readonly '75': {
            readonly title: "ممتاز! تقريباً وصلت للهدف";
            readonly message: "وصلت إلى 75% من هدف {goalName}. الهدف قريب جداً!";
        };
        readonly '100': {
            readonly title: "مبروك! حققت هدفك";
            readonly message: "تهانينا! لقد حققت هدف {goalName} بنجاح. حان الوقت لهدف جديد!";
        };
    };
    readonly SPENDING_ALERT: {
        readonly '80': {
            readonly title: "تنبيه: اقتربت من حد الإنفاق";
            readonly message: "لقد أنفقت 80% من ميزانيتك الشهرية. انتبه للإنفاق المتبقي.";
        };
        readonly '100': {
            readonly title: "تحذير: تجاوزت حد الإنفاق";
            readonly message: "لقد تجاوزت ميزانيتك الشهرية. راجع نفقاتك وخطط للشهر القادم.";
        };
    };
};
export declare const ARABIC_MONTHS: readonly ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
export declare const ARABIC_DAYS: readonly ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
export declare const ANALYTICS_PERIODS: {
    readonly WEEK: "week";
    readonly MONTH: "month";
    readonly QUARTER: "quarter";
    readonly YEAR: "year";
};
export declare const CACHE_TTL: {
    readonly SHORT: 300;
    readonly MEDIUM: 1800;
    readonly LONG: 3600;
    readonly VERY_LONG: 86400;
};
export declare const JOB_PRIORITY: {
    readonly HIGH: 1;
    readonly MEDIUM: 5;
    readonly LOW: 10;
};
export declare const TIMEOUTS: {
    readonly DATABASE: 30000;
    readonly EXTERNAL_API: 10000;
    readonly SMS_SERVICE: 15000;
    readonly FILE_UPLOAD: 60000;
};
export declare const VALIDATION_MESSAGES: {
    readonly REQUIRED: "هذا الحقل مطلوب";
    readonly INVALID_EMAIL: "عنوان البريد الإلكتروني غير صحيح";
    readonly INVALID_PHONE: "رقم الهاتف غير صحيح";
    readonly WEAK_PASSWORD: "كلمة المرور ضعيفة. يجب أن تحتوي على 8 أحرف على الأقل مع أرقام وحروف كبيرة وصغيرة";
    readonly INVALID_DATE: "التاريخ غير صحيح";
    readonly INVALID_AMOUNT: "المبلغ غير صحيح";
    readonly MIN_LENGTH: "الطول الأدنى {min} أحرف";
    readonly MAX_LENGTH: "الطول الأقصى {max} حرف";
    readonly MIN_VALUE: "القيمة الدنيا {min}";
    readonly MAX_VALUE: "القيمة العليا {max}";
};
export declare const SUCCESS_MESSAGES: {
    readonly USER_REGISTERED: "تم تسجيل المستخدم بنجاح";
    readonly OTP_SENT: "تم إرسال رمز التحقق إلى هاتفك";
    readonly ACCOUNT_VERIFIED: "تم تفعيل الحساب بنجاح";
    readonly LOGIN_SUCCESS: "تم تسجيل الدخول بنجاح";
    readonly PROFILE_UPDATED: "تم تحديث الملف الشخصي بنجاح";
    readonly GOAL_CREATED: "تم إنشاء الهدف المالي بنجاح";
    readonly GOAL_UPDATED: "تم تحديث الهدف المالي بنجاح";
    readonly GOAL_DELETED: "تم حذف الهدف المالي بنجاح";
    readonly EXPENSE_CREATED: "تم إضافة المصروف بنجاح";
    readonly EXPENSE_UPDATED: "تم تحديث المصروف بنجاح";
    readonly EXPENSE_DELETED: "تم حذف المصروف بنجاح";
    readonly TRANSACTION_ADDED: "تم إضافة المعاملة بنجاح";
    readonly NOTIFICATION_READ: "تم قراءة الإشعار";
    readonly INSIGHT_READ: "تم قراءة النصيحة";
};
export declare const ERROR_MESSAGES: {
    readonly PHONE_EXISTS: "رقم الهاتف مستخدم مسبقاً";
    readonly INVALID_CREDENTIALS: "بيانات الدخول غير صحيحة";
    readonly ACCOUNT_NOT_VERIFIED: "الحساب غير مفعل. يرجى التحقق من رقم الهاتف";
    readonly ACCOUNT_SUSPENDED: "الحساب معلق. يرجى التواصل مع الدعم";
    readonly OTP_EXPIRED: "انتهت صلاحية رمز التحقق";
    readonly OTP_INVALID: "رمز التحقق غير صحيح";
    readonly OTP_MAX_ATTEMPTS: "تم تجاوز الحد الأقصى لمحاولات رمز التحقق";
    readonly ONBOARDING_INCOMPLETE: "يرجى إكمال عملية التسجيل";
    readonly ONBOARDING_COMPLETE: "تم إكمال عملية التسجيل مسبقاً";
    readonly GOAL_NOT_FOUND: "الهدف المالي غير موجود";
    readonly EXPENSE_NOT_FOUND: "المصروف غير موجود";
    readonly INSUFFICIENT_BALANCE: "الرصيد غير كافي";
    readonly INVALID_AMOUNT: "المبلغ غير صحيح";
    readonly RATE_LIMIT_EXCEEDED: "تم تجاوز الحد المسموح من الطلبات. حاول مرة أخرى لاحقاً";
    readonly INTERNAL_ERROR: "حدث خطأ في النظام. يرجى المحاولة مرة أخرى";
    readonly SERVICE_UNAVAILABLE: "الخدمة غير متاحة حالياً";
};
export declare const REGEX_PATTERNS: {
    readonly PHONE_NUMBER: RegExp;
    readonly PASSWORD: RegExp;
    readonly OTP: RegExp;
    readonly UUID: RegExp;
    readonly AMOUNT: RegExp;
    readonly COLOR_HEX: RegExp;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
};
//# sourceMappingURL=constants.d.ts.map