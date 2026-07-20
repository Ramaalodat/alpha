// Application constants
export const APP_CONFIG = {
  NAME: 'BASIRA',
  VERSION: '1.0.0',
  DESCRIPTION: 'Your Resilient Partner in Financial Growth',
  AUTHOR: 'Team Alpha',
} as const;

// Phone number validation
export const PHONE_CONFIG = {
  JORDAN_PREFIX: '+962',
  LOCAL_PREFIXES: ['07', '079', '077', '078'],
  MIN_LENGTH: 9,
  MAX_LENGTH: 10,
  REGEX: /^(\+962|0)?(7[789]\d{7})$/,
} as const;

// Password validation
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: false,
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

// OTP configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 100, // Increased for dev
  RATE_LIMIT_WINDOW_MINUTES: 15,
  DAILY_LIMIT: 1000, // Increased for dev
  BLOCKED_DURATION_MINUTES: 60,
} as const;

// JWT configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '30d',
  REFRESH_TOKEN_EXPIRY: '60d',
  ISSUER: 'basira-api',
  AUDIENCE: 'basira-app',
} as const;

// Rate limiting
export const RATE_LIMITS = {
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
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

// Currency configuration (Jordan)
export const CURRENCY_CONFIG = {
  CODE: 'JOD',
  SYMBOL: 'د.أ',
  DECIMAL_PLACES: 2,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99,
} as const;

// File upload configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    DOCUMENTS: ['application/pdf'],
  },
  UPLOAD_PATH: 'uploads/',
  TEMP_PATH: 'temp/',
} as const;

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES = [
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
  { name: 'Other Fixed', icon: '📋', color: '#6B7280' },
  { name: 'Other Variable', icon: '📝', color: '#9CA3AF' },
] as const;

// Goal icons
export const GOAL_ICONS = [
  '🏠', '🚗', '✈️', '💍', '📚', '💰', '🎓', '💻', 
  '📱', '🏖️', '🍽️', '👕', '⚽', '🎮', '🎸', '📷',
  '🏥', '🏦', '🏢', '🌟', '🎯', '💎', '🏆', '🎊',
] as const;

// Notification templates
export const NOTIFICATION_TEMPLATES = {
  GOAL_MILESTONE: {
    '25': {
      title: 'Congratulations! You reached 25% of your goal',
      message: 'You have covered a quarter of the way to {goalName}. Keep saving!',
    },
    '50': {
      title: 'Awesome! Halfway there',
      message: 'You reached 50% of your goal {goalName}. You are on the right track!',
    },
    '75': {
      title: 'Excellent! Almost there',
      message: 'You reached 75% of your goal {goalName}. The goal is very close!',
    },
    '100': {
      title: 'Congratulations! You achieved your goal',
      message: 'Congratulations! You successfully achieved your goal {goalName}. Time for a new goal!',
    },
  },
  SPENDING_ALERT: {
    '80': {
      title: 'Alert: Approaching spending limit',
      message: 'You have spent 80% of your monthly budget. Watch your remaining spending.',
    },
    '100': {
      title: 'Warning: Spending limit exceeded',
      message: 'You have exceeded your monthly budget. Review your expenses and plan for next month.',
    },
  },
} as const;

// Arabic month names
export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
] as const;

// Arabic day names
export const ARABIC_DAYS = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 
  'الخميس', 'الجمعة', 'السبت'
] as const;

// Analytics periods
export const ANALYTICS_PERIODS = {
  WEEK: 'week',
  MONTH: 'month', 
  QUARTER: 'quarter',
  YEAR: 'year',
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300,     // 5 minutes
  MEDIUM: 1800,   // 30 minutes  
  LONG: 3600,     // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Background job priorities
export const JOB_PRIORITY = {
  HIGH: 1,
  MEDIUM: 5,
  LOW: 10,
} as const;

// API timeouts (in milliseconds)
export const TIMEOUTS = {
  DATABASE: 30000,    // 30 seconds
  EXTERNAL_API: 10000, // 10 seconds
  SMS_SERVICE: 15000,  // 15 seconds
  FILE_UPLOAD: 60000,  // 1 minute
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  WEAK_PASSWORD: 'Password is weak. It must be at least 8 characters long and contain numbers, uppercase, and lowercase letters',
  INVALID_DATE: 'Invalid date',
  INVALID_AMOUNT: 'Invalid amount',
  MIN_LENGTH: 'Minimum length is {min} characters',
  MAX_LENGTH: 'Maximum length is {max} characters',
  MIN_VALUE: 'Minimum value is {min}',
  MAX_VALUE: 'Maximum value is {max}',
  USERNAME_MIN_LENGTH: 'Username must be at least 3 characters',
  USERNAME_MAX_LENGTH: 'Username cannot exceed 100 characters',
  INCOME_AMOUNT_POSITIVE: 'Income amount must be greater than zero',
  EXPENSE_AMOUNT_POSITIVE: 'Expense amount must be greater than zero',
  GOAL_TARGET_AMOUNT_POSITIVE: 'Target amount must be greater than zero',
  PINNED_MONTHS_INVALID: 'Pinned months must be 3, 6, or 12',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  OTP_SENT: 'Verification code has been sent to your phone',
  ACCOUNT_VERIFIED: 'Account activated successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  GOAL_CREATED: 'Financial goal created successfully',
  GOAL_UPDATED: 'Financial goal updated successfully',
  GOAL_DELETED: 'Financial goal deleted successfully',
  EXPENSE_CREATED: 'Expense added successfully',
  EXPENSE_UPDATED: 'Expense updated successfully',
  EXPENSE_DELETED: 'Expense deleted successfully',
  TRANSACTION_ADDED: 'Transaction added successfully',
  NOTIFICATION_READ: 'Notification read',
  INSIGHT_READ: 'Insight read',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  PHONE_EXISTS: 'Phone number is already in use',
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCOUNT_NOT_VERIFIED: 'Account not verified. Please verify your phone number',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  ACCOUNT_SUSPENDED: 'Account suspended. Please contact support',
  OTP_EXPIRED: 'Verification code has expired',
  OTP_INVALID: 'Invalid verification code',
  OTP_MAX_ATTEMPTS: 'Maximum verification attempts exceeded',
  ONBOARDING_INCOMPLETE: 'Please complete the registration process',
  ONBOARDING_COMPLETE: 'Registration process has already been completed',
  GOAL_NOT_FOUND: 'Financial goal not found',
  EXPENSE_NOT_FOUND: 'Expense not found',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Invalid amount',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later',
  INTERNAL_ERROR: 'Internal system error. Please try again',
  SERVICE_UNAVAILABLE: 'Service is currently unavailable',
  EMAIL_ALREADY_EXISTS: 'Email address is already registered',
  USERNAME_ALREADY_EXISTS: 'Username is already registered',
  INVALID_GENDER: 'Invalid gender',
  INVALID_MARITAL_STATUS: 'Invalid marital status',
  INVALID_INCOME_SOURCE_TYPE: 'Invalid income source type',
  INVALID_EXPENSE_TYPE: 'Invalid expense type',
  INVALID_GOAL_FLEXIBILITY: 'Invalid goal type',
  BUDGET_DEFICIT: 'Total expenses are greater than total income. Please correct the data',
  BUDGET_VALIDATION_REQUIRED: 'Total income must equal total expenses',
  CANNOT_POSTPONE_FIXED_GOAL: 'Fixed goals cannot be postponed',
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
  PHONE_NUMBER: /^(\+962|962|0)?(7[789]\d{7})$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  OTP: /^\d{6}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  AMOUNT: /^\d+(\.\d{1,2})?$/,
  COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// HTTP status codes
export const HTTP_STATUS = {
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
} as const;

// =============================================
// PDF SPECIFICATION CONSTANTS
// =============================================

export const INCOME_SOURCE_TYPES = {
  REGULAR_SALARY: { key: 'REGULAR_SALARY', label: 'راتب منتظم ودائم', labelEn: 'Regular Salary' },
  TEMPORARY_JOB: { key: 'TEMPORARY_JOB', label: 'راتب وظيفة مؤقتة', labelEn: 'Temporary Job' },
  FAMILY_ALLOWANCE: { key: 'FAMILY_ALLOWANCE', label: 'مخصصات مالية من العائلة', labelEn: 'Family Allowance' },
  EXTERNAL_HELP: { key: 'EXTERNAL_HELP', label: 'مساعدة خارجية', labelEn: 'External Help' },
  RENTAL_INCOME: { key: 'RENTAL_INCOME', label: 'إيراد تأجير عقار', labelEn: 'Rental Income' },
  OTHER_INCOME: { key: 'OTHER_INCOME', label: 'إيرادات أخرى', labelEn: 'Other Income' },
};

export const FIXED_EXPENSE_CATEGORIES = {
  TUITION: { key: 'TUITION', label: 'رسوم دراسية', labelEn: 'Tuition' },
  RENT: { key: 'RENT', label: 'إيجار المنزل', labelEn: 'Rent' },
  LOAN: { key: 'LOAN', label: 'قسط التمويل', labelEn: 'Loan Installment' },
  UTILITIES: { key: 'UTILITIES', label: 'فواتير الخدمات', labelEn: 'Utilities' },
  TREATMENT: { key: 'TREATMENT', label: 'علاج', labelEn: 'Treatment' },
  SAVINGS: { key: 'SAVINGS', label: 'الادخار', labelEn: 'Savings' },
  OTHER_FIXED: { key: 'OTHER_FIXED', label: 'أخرى', labelEn: 'Other' },
};

export const VARIABLE_EXPENSE_CATEGORIES = {
  FOOD: { key: 'FOOD', label: 'الطعام', labelEn: 'Food' },
  TRANSPORT: { key: 'TRANSPORT', label: 'المواصلات', labelEn: 'Transportation' },
  CLOTHING: { key: 'CLOTHING', label: 'ملابس وأحذية وحقائب', labelEn: 'Clothing & Accessories' },
  EVENTS: { key: 'EVENTS', label: 'أعياد ومناسبات خاصة', labelEn: 'Events & Occasions' },
  ENTERTAINMENT: { key: 'ENTERTAINMENT', label: 'ترفيه', labelEn: 'Entertainment' },
  TREATMENT_REHAB: { key: 'TREATMENT_REHAB', label: 'علاج وتأهيل', labelEn: 'Treatment & Rehab' },
  PERSONAL_CARE: { key: 'PERSONAL_CARE', label: 'رعاية شخصية', labelEn: 'Personal Care' },
  OTHER_VARIABLE: { key: 'OTHER_VARIABLE', label: 'أخرى', labelEn: 'Other' },
};

export const GOAL_CATEGORIES = {
  EMERGENCY_FUND: { key: 'EMERGENCY_FUND', label: 'صندوق طوارئ', labelEn: 'Emergency Fund' },
  LAPTOP: { key: 'LAPTOP', label: 'شراء لابتوب', labelEn: 'Laptop' },
  GROUP_TRIP: { key: 'GROUP_TRIP', label: 'رحلة جماعية (عمرة / سياحة)', labelEn: 'Group Trip' },
  HOLIDAY_EXPENSES: { key: 'HOLIDAY_EXPENSES', label: 'مصروفات الأعياد', labelEn: 'Holiday Expenses' },
  TUITION: { key: 'TUITION', label: 'الرسوم الدراسية', labelEn: 'Tuition' },
  CAR: { key: 'CAR', label: 'شراء سيارة', labelEn: 'Car' },
  ELECTRONICS: { key: 'ELECTRONICS', label: 'شراء أجهزة كهربائية', labelEn: 'Electronics' },
  FURNITURE: { key: 'FURNITURE', label: 'شراء أثاث', labelEn: 'Furniture' },
  CLOTHING: { key: 'CLOTHING', label: 'ملابس وأحذية وحقائب', labelEn: 'Clothing' },
  OTHER_GOAL: { key: 'OTHER_GOAL', label: 'أخرى', labelEn: 'Other' },
};

export const MONEY_RELATIONSHIP_OPTIONS = {
  SAVING_CAREFULLY: { key: 'SAVING_CAREFULLY', label: 'ادخار بحذر', labelEn: 'Saving Carefully' },
  BALANCED_SPENDING: { key: 'BALANCED_SPENDING', label: 'إنفاق متوازن', labelEn: 'Balanced Spending' },
  EMOTIONAL_SPENDING: { key: 'EMOTIONAL_SPENDING', label: 'إنفاق عاطفي', labelEn: 'Emotional Spending' },
  OTHER: { key: 'OTHER', label: 'أخرى', labelEn: 'Other' },
};

export const MAIN_FINANCIAL_GOALS_12M = {
  EDUCATION: { key: 'EDUCATION', label: 'تعليم', labelEn: 'Education' },
  TECHNOLOGY: { key: 'TECHNOLOGY', label: 'تكنولوجيا', labelEn: 'Technology' },
  TRAVEL: { key: 'TRAVEL', label: 'سفر', labelEn: 'Travel' },
  CAR: { key: 'CAR', label: 'سيارة', labelEn: 'Car' },
  OTHER: { key: 'OTHER', label: 'أخرى', labelEn: 'Other' },
};

export const PINNED_MONTHS_OPTIONS = [3, 6, 12] as const;