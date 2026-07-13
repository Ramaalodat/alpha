# BASIRA API Documentation

## Base URL
- **Production**: `https://api.basira-app.com/v1`
- **Development**: `http://localhost:3000/v1`

## Authentication
Most endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Standard Response Format
```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "error": {
    "code": string,
    "message": string,
    "details": object
  } | null,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  } | null
}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "phone_number": "07XXXXXXXX",
  "full_name": "أحمد محمد علي",
  "birth_date": "1995-05-15",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your phone.",
  "data": {
    "user_id": "uuid",
    "phone_number": "07XXXXXXXX",
    "otp_expires_in": 300
  }
}
```

**Error Responses:**
- `400` - Invalid input data
- `409` - Phone number already exists

### 2. Verify OTP
**POST** `/auth/verify-otp`

Verify OTP code sent during registration.

**Request Body:**
```json
{
  "phone_number": "07XXXXXXXX",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account verified successfully",
  "data": {
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "phone_number": "07XXXXXXXX",
      "full_name": "أحمد محمد علي",
      "is_onboarded": false
    }
  }
}
```

### 3. Login
**POST** `/auth/login`

User login with phone number and password.

**Request Body:**
```json
{
  "phone_number": "07XXXXXXXX",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "phone_number": "07XXXXXXXX",
      "full_name": "أحمد محمد علي",
      "is_onboarded": true
    }
  }
}
```

### 4. Refresh Token
**POST** `/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new_jwt_access_token",
    "refresh_token": "new_jwt_refresh_token",
    "expires_in": 900
  }
}
```

### 5. Logout
**POST** `/auth/logout`
**Authentication Required**

Logout user and invalidate tokens.

**Request Body:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 6. Resend OTP
**POST** `/auth/resend-otp`

Resend OTP code for verification.

**Request Body:**
```json
{
  "phone_number": "07XXXXXXXX",
  "purpose": "registration" // or "login", "password_reset"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expires_in": 300
  }
}
```

---

## Onboarding Endpoints

### 1. Save Financial Information
**POST** `/onboarding/financial-info`
**Authentication Required**

Save user's financial information during onboarding.

**Request Body:**
```json
{
  "monthly_income": 1500.00,
  "basic_expenses": 800.00,
  "financial_goal": "بناء صندوق طوارئ للمستقبل",
  "primary_spending_category": "Food & Dining"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Financial information saved successfully",
  "data": {
    "profile_id": "uuid",
    "next_step": "create_first_goal"
  }
}
```

### 2. Create First Goal
**POST** `/onboarding/first-goal`
**Authentication Required**

Create user's first financial goal.

**Request Body:**
```json
{
  "icon": "🏠",
  "name": "شراء منزل",
  "target_amount": 50000.00,
  "target_date": "2025-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "First goal created successfully",
  "data": {
    "goal_id": "uuid",
    "onboarding_completed": true
  }
}
```

### 3. Get Onboarding Status
**GET** `/onboarding/status`
**Authentication Required**

Get current onboarding completion status.

**Response:**
```json
{
  "success": true,
  "data": {
    "is_completed": false,
    "steps": {
      "financial_info": true,
      "first_goal": false
    },
    "next_step": "create_first_goal"
  }
}
```

---

## User Management Endpoints

### 1. Get User Profile
**GET** `/users/profile`
**Authentication Required**

Get current user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone_number": "07XXXXXXXX",
      "full_name": "أحمد محمد علي",
      "birth_date": "1995-05-15",
      "is_onboarded": true,
      "created_at": "2024-01-01T00:00:00Z"
    },
    "profile": {
      "monthly_income": 1500.00,
      "basic_expenses": 800.00,
      "financial_goal": "بناء صندوق طوارئ",
      "primary_spending_category": "Food & Dining",
      "version": 1
    }
  }
}
```

### 2. Update User Profile
**PUT** `/users/profile`
**Authentication Required**

Update user profile information (creates new version).

**Request Body:**
```json
{
  "full_name": "أحمد محمد علي الجديد",
  "monthly_income": 1800.00,
  "basic_expenses": 900.00,
  "financial_goal": "هدف مالي محدث",
  "primary_spending_category": "Transportation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile_id": "uuid",
    "version": 2
  }
}
```

### 3. Get Profile History
**GET** `/users/profile/history`
**Authentication Required**

Get user profile version history.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "version": 2,
      "monthly_income": 1800.00,
      "basic_expenses": 900.00,
      "financial_goal": "هدف مالي محدث",
      "primary_spending_category": "Transportation",
      "is_current": true,
      "created_at": "2024-01-15T00:00:00Z"
    },
    {
      "version": 1,
      "monthly_income": 1500.00,
      "basic_expenses": 800.00,
      "financial_goal": "بناء صندوق طوارئ",
      "primary_spending_category": "Food & Dining",
      "is_current": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

## Financial Goals Endpoints

### 1. List Financial Goals
**GET** `/goals`
**Authentication Required**

Get user's financial goals.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `completed`, `paused`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "icon": "🏠",
      "name": "شراء منزل",
      "target_amount": 50000.00,
      "current_amount": 5000.00,
      "target_date": "2025-12-31",
      "status": "active",
      "progress_percentage": 10.00,
      "days_remaining": 365,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Create Financial Goal
**POST** `/goals`
**Authentication Required**

Create a new financial goal.

**Request Body:**
```json
{
  "icon": "🚗",
  "name": "شراء سيارة",
  "target_amount": 25000.00,
  "target_date": "2024-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "id": "uuid",
    "icon": "🚗",
    "name": "شراء سيارة",
    "target_amount": 25000.00,
    "current_amount": 0.00,
    "target_date": "2024-12-31",
    "status": "active",
    "progress_percentage": 0.00
  }
}
```

### 3. Get Goal Details
**GET** `/goals/:id`
**Authentication Required**

Get specific goal details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "icon": "🚗",
    "name": "شراء سيارة",
    "target_amount": 25000.00,
    "current_amount": 2500.00,
    "target_date": "2024-12-31",
    "status": "active",
    "progress_percentage": 10.00,
    "days_remaining": 200,
    "recent_transactions": [
      {
        "id": "uuid",
        "amount": 500.00,
        "transaction_type": "deposit",
        "description": "مدخرات شهرية",
        "created_at": "2024-01-15T00:00:00Z"
      }
    ]
  }
}
```

### 4. Update Goal
**PUT** `/goals/:id`
**Authentication Required**

Update financial goal.

**Request Body:**
```json
{
  "name": "شراء سيارة جديدة",
  "target_amount": 30000.00,
  "target_date": "2025-06-30",
  "status": "active"
}
```

### 5. Delete Goal
**DELETE** `/goals/:id`
**Authentication Required**

Delete financial goal (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

### 6. Add Money to Goal
**POST** `/goals/:id/transactions`
**Authentication Required**

Add or withdraw money from goal.

**Request Body:**
```json
{
  "amount": 500.00,
  "transaction_type": "deposit",
  "description": "مدخرات أسبوعية"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction added successfully",
  "data": {
    "transaction_id": "uuid",
    "new_current_amount": 3000.00,
    "progress_percentage": 12.00
  }
}
```

---

## Expenses Endpoints

### 1. List Expenses
**GET** `/expenses`
**Authentication Required**

Get user's expenses.

**Query Parameters:**
- `category_id` (optional): Filter by category
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 25.50,
      "description": "غداء في المطعم",
      "expense_date": "2024-01-15",
      "category": {
        "id": "uuid",
        "name": "Food & Dining",
        "icon": "🍽️",
        "color": "#EF4444"
      },
      "payment_method": "cash",
      "location": "مطعم الأصالة",
      "created_at": "2024-01-15T12:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 2. Create Expense
**POST** `/expenses`
**Authentication Required**

Create a new expense entry.

**Request Body:**
```json
{
  "category_id": "uuid",
  "amount": 45.00,
  "description": "تسوق أسبوعي",
  "expense_date": "2024-01-15",
  "payment_method": "card",
  "location": "سوبر ماركت",
  "receipt_url": "https://storage.example.com/receipts/uuid.jpg",
  "is_recurring": false,
  "tags": ["groceries", "weekly"],
  "notes": "تسوق أساسيات المنزل"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": "uuid",
    "amount": 45.00,
    "description": "تسوق أسبوعي",
    "expense_date": "2024-01-15",
    "category": {
      "name": "Shopping",
      "icon": "🛍️"
    }
  }
}
```

### 3. Get Expense Categories
**GET** `/expenses/categories`
**Authentication Required**

Get available expense categories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Food & Dining",
      "icon": "🍽️",
      "color": "#EF4444",
      "is_default": true
    },
    {
      "id": "uuid",
      "name": "Transportation",
      "icon": "🚗",
      "color": "#3B82F6",
      "is_default": true
    }
  ]
}
```

### 4. Create Custom Category
**POST** `/expenses/categories`
**Authentication Required**

Create custom expense category.

**Request Body:**
```json
{
  "name": "العلاج الطبيعي",
  "icon": "🏥",
  "color": "#10B981"
}
```

---

## Analytics Endpoints

### 1. Spending Analytics
**GET** `/analytics/spending`
**Authentication Required**

Get spending analytics and trends.

**Query Parameters:**
- `period` (optional): `week`, `month`, `quarter`, `year` (default: `month`)
- `start_date` (optional): Custom start date
- `end_date` (optional): Custom end date

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_spent": 1250.00,
      "period": "month",
      "budget_limit": 1500.00,
      "remaining_budget": 250.00,
      "days_remaining": 15
    },
    "by_category": [
      {
        "category": "Food & Dining",
        "amount": 450.00,
        "percentage": 36.0,
        "trend": "up"
      },
      {
        "category": "Transportation",
        "amount": 300.00,
        "percentage": 24.0,
        "trend": "stable"
      }
    ],
    "daily_spending": [
      {
        "date": "2024-01-15",
        "amount": 75.50
      }
    ],
    "trends": {
      "compared_to_last_period": {
        "change_percentage": 12.5,
        "change_amount": 138.89,
        "trend": "increase"
      }
    }
  }
}
```

### 2. Goals Analytics
**GET** `/analytics/goals`
**Authentication Required**

Get goal progress analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_goals": 3,
      "active_goals": 2,
      "completed_goals": 1,
      "total_saved": 7500.00,
      "total_target": 75000.00,
      "overall_progress": 10.0
    },
    "goals_progress": [
      {
        "id": "uuid",
        "name": "شراء منزل",
        "progress_percentage": 15.0,
        "on_track": true,
        "projected_completion": "2025-11-15",
        "monthly_savings_needed": 1250.00
      }
    ],
    "savings_timeline": [
      {
        "month": "2024-01",
        "total_saved": 500.00,
        "goals_contributed": 2
      }
    ]
  }
}
```

### 3. Financial Predictions
**GET** `/analytics/predictions`
**Authentication Required**

Get AI-powered financial predictions.

**Response:**
```json
{
  "success": true,
  "data": {
    "spending_forecast": {
      "next_month": 1400.00,
      "confidence": 0.85,
      "factors": ["seasonal_increase", "recurring_bills"]
    },
    "goal_projections": [
      {
        "goal_id": "uuid",
        "goal_name": "شراء سيارة",
        "projected_completion": "2025-03-15",
        "probability": 0.78,
        "recommendations": [
          "زيادة المدخرات الشهرية بـ 200 دينار",
          "تقليل الإنفاق على الترفيه بنسبة 15%"
        ]
      }
    ],
    "financial_health_score": 75,
    "improvement_areas": [
      "emergency_fund",
      "impulse_spending"
    ]
  }
}
```

---

## AI Insights Endpoints

### 1. Get Insights
**GET** `/insights`
**Authentication Required**

Get AI-generated financial insights.

**Query Parameters:**
- `type` (optional): Filter by insight type
- `unread` (optional): Show only unread insights (true/false)
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "insight_type": "spending_pattern",
      "title": "ملاحظة في نمط الإنفاق",
      "description": "لاحظنا زيادة في إنفاقك على الطعام بنسبة 25% هذا الشهر مقارنة بالشهر الماضي",
      "priority": "medium",
      "is_read": false,
      "data": {
        "category": "Food & Dining",
        "increase_percentage": 25.0,
        "previous_amount": 400.00,
        "current_amount": 500.00
      },
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Mark Insight as Read
**PUT** `/insights/:id/read`
**Authentication Required**

Mark specific insight as read.

**Response:**
```json
{
  "success": true,
  "message": "Insight marked as read"
}
```

---

## Notifications Endpoints

### 1. Get Notifications
**GET** `/notifications`
**Authentication Required**

Get user notifications.

**Query Parameters:**
- `unread` (optional): Show only unread notifications
- `type` (optional): Filter by notification type
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "goal_milestone",
      "title": "تهانينا! وصلت إلى 25% من هدفك",
      "message": "لقد حققت 25% من هدف شراء السيارة. استمر في الادخار!",
      "is_read": false,
      "data": {
        "goal_id": "uuid",
        "milestone_percentage": 25
      },
      "created_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

### 2. Mark Notification as Read
**PUT** `/notifications/:id/read`
**Authentication Required**

### 3. Mark All Notifications as Read
**PUT** `/notifications/read-all`
**Authentication Required**

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `OTP_EXPIRED` | 400 | OTP code has expired |
| `OTP_INVALID` | 400 | Invalid OTP code |
| `ONBOARDING_INCOMPLETE` | 400 | User must complete onboarding |

---

## Rate Limiting

- **General API**: 100 requests per minute per user
- **OTP Requests**: 3 requests per 15 minutes per phone number
- **Authentication**: 5 login attempts per 15 minutes per phone number

## Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642681200
X-Request-ID: uuid
```