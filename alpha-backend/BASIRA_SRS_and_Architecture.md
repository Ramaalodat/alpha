# BASIRA Backend - Software Requirements Specification & System Architecture

## Project Overview
**BASIRA (Alpha)** - "Your Resilient Partner in Financial Growth"

A fintech application targeting Jordanian youth (18-30) and university students (18-24) to provide proactive financial guidance, behavioral analytics, and culturally-aware financial mentorship without requiring banking integration.

---

## 1. TECHNOLOGY STACK SELECTION & JUSTIFICATION

### Backend Framework: **Node.js with TypeScript + Fastify**
**Why:**
- **Performance**: Fastify is 2x faster than Express with built-in validation
- **Type Safety**: TypeScript reduces runtime errors and improves maintainability
- **Scalability**: Non-blocking I/O perfect for real-time financial analytics
- **AI Integration**: Excellent ecosystem for ML/AI libraries and API integrations
- **Developer Experience**: Rich ecosystem, extensive tooling, and rapid development

### Database: **PostgreSQL + Redis**
**PostgreSQL (Primary):**
- **ACID Compliance**: Essential for financial data integrity
- **JSON Support**: Flexible for user preferences and analytics data
- **Performance**: Excellent for complex queries and analytics
- **Audit Logging**: Built-in support for versioning and audit trails

**Redis (Cache & Sessions):**
- **Session Management**: Fast session storage and OTP management
- **Caching**: Real-time analytics and frequently accessed data
- **Rate Limiting**: API throttling and security

### ORM: **Prisma**
**Why:**
- **Type Safety**: Auto-generated types from database schema
- **Migrations**: Version-controlled database changes
- **Performance**: Optimized queries and connection pooling
- **Developer Experience**: Excellent tooling and introspection

### Authentication: **JWT + Refresh Tokens**
**Why:**
- **Stateless**: Scalable across multiple servers
- **Security**: Short-lived access tokens with refresh mechanism
- **Mobile-First**: Perfect for mobile applications

### Additional Services:
- **Winston**: Structured logging with multiple transports
- **Joi**: Schema validation for API requests
- **bcryptjs**: Password hashing with salt
- **node-cron**: Scheduled tasks for analytics and notifications
- **Twilio/SMS Provider**: OTP delivery
- **Bull Queue**: Background job processing
- **Helmet**: Security headers and protection
- **Rate Limiter**: API protection

---

## 2. SYSTEM REQUIREMENTS

### 2.1 Functional Requirements

#### Authentication & User Management
- **FR-001**: User registration with phone number, name, birth date, password
- **FR-002**: OTP verification for phone number validation
- **FR-003**: Login with phone number and password
- **FR-004**: Account activation only after successful OTP verification
- **FR-005**: User profile management with version history/audit log

#### Onboarding Process
- **FR-006**: Collect monthly income during onboarding
- **FR-007**: Collect basic expenses during onboarding
- **FR-008**: Collect financial goals during onboarding
- **FR-009**: Collect primary spending category during onboarding
- **FR-010**: Guide user through first financial goal creation
- **FR-011**: Account becomes active only after completing onboarding

#### Financial Goals Management
- **FR-012**: Create financial goals with icon, name, target amount, target date
- **FR-013**: Edit existing financial goals
- **FR-014**: Delete financial goals
- **FR-015**: Track goal progress and milestones
- **FR-016**: Multiple concurrent goals support

#### Expense Tracking & Analytics
- **FR-017**: Manual expense entry
- **FR-018**: Multimodal input support (voice notes, photos, bills)
- **FR-019**: OCR processing for bill/receipt scanning
- **FR-020**: Categorize expenses automatically and manually
- **FR-021**: Spending pattern analysis and insights
- **FR-022**: Monthly/weekly spending summaries

#### AI-Powered Financial Guidance
- **FR-023**: Proactive spending alerts and recommendations
- **FR-024**: Behavioral analysis and trend identification
- **FR-025**: "What-if" scenario modeling for financial decisions
- **FR-026**: Personalized financial tips and guidance
- **FR-027**: Cultural and regional context in recommendations

#### Notification System
- **FR-028**: Goal milestone notifications
- **FR-029**: Spending limit alerts
- **FR-030**: Weekly/monthly financial summaries
- **FR-031**: Motivational and educational notifications

### 2.2 Non-Functional Requirements

#### Performance
- **NFR-001**: API response time < 200ms for 95% of requests
- **NFR-002**: Support 1000+ concurrent users
- **NFR-003**: 99.9% uptime availability
- **NFR-004**: Database queries optimized for < 100ms execution

#### Security
- **NFR-005**: All sensitive data encrypted at rest (AES-256)
- **NFR-006**: All API communications over HTTPS/TLS 1.3
- **NFR-007**: Password hashing with bcrypt (12+ rounds)
- **NFR-008**: JWT tokens with 15-minute expiry
- **NFR-009**: Rate limiting: 100 requests/minute per user
- **NFR-010**: Input validation and sanitization
- **NFR-011**: SQL injection prevention
- **NFR-012**: OWASP Top 10 compliance

#### Scalability
- **NFR-013**: Horizontal scaling capability
- **NFR-014**: Stateless application design
- **NFR-015**: Database connection pooling
- **NFR-016**: Background job processing for heavy operations

#### Privacy & Compliance
- **NFR-017**: No banking account integration (by design)
- **NFR-018**: User data isolation and privacy
- **NFR-019**: Right to data deletion
- **NFR-020**: Audit logging for all data changes
- **NFR-021**: GDPR-ready data handling

---

## 3. DATABASE DESIGN (ERD)

### Core Entities

```sql
-- Users Table
users (
  id: UUID PRIMARY KEY,
  phone_number: VARCHAR UNIQUE NOT NULL,
  full_name: VARCHAR NOT NULL,
  birth_date: DATE NOT NULL,
  password_hash: VARCHAR NOT NULL,
  is_verified: BOOLEAN DEFAULT FALSE,
  is_onboarded: BOOLEAN DEFAULT FALSE,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
);

-- User Profiles with Versioning
user_profiles (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  monthly_income: DECIMAL(10,2),
  basic_expenses: DECIMAL(10,2),
  primary_spending_category: VARCHAR,
  version: INTEGER DEFAULT 1,
  is_current: BOOLEAN DEFAULT TRUE,
  created_at: TIMESTAMP DEFAULT NOW(),
  created_by: UUID REFERENCES users(id)
);

-- Financial Goals
financial_goals (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  icon: VARCHAR NOT NULL,
  name: VARCHAR NOT NULL,
  target_amount: DECIMAL(10,2) NOT NULL,
  current_amount: DECIMAL(10,2) DEFAULT 0,
  target_date: DATE NOT NULL,
  status: ENUM('active', 'completed', 'paused', 'deleted') DEFAULT 'active',
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
);

-- Expense Categories
expense_categories (
  id: UUID PRIMARY KEY,
  name: VARCHAR NOT NULL,
  icon: VARCHAR,
  color: VARCHAR,
  is_default: BOOLEAN DEFAULT FALSE,
  created_by: UUID REFERENCES users(id) NULL,
  created_at: TIMESTAMP DEFAULT NOW()
);

-- Expenses
expenses (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  category_id: UUID REFERENCES expense_categories(id),
  amount: DECIMAL(10,2) NOT NULL,
  description: TEXT,
  date: DATE NOT NULL,
  payment_method: VARCHAR,
  location: VARCHAR,
  receipt_url: VARCHAR,
  is_recurring: BOOLEAN DEFAULT FALSE,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
);

-- Goal Transactions (Money allocated to goals)
goal_transactions (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  goal_id: UUID REFERENCES financial_goals(id),
  amount: DECIMAL(10,2) NOT NULL,
  transaction_type: ENUM('deposit', 'withdrawal') NOT NULL,
  description: TEXT,
  created_at: TIMESTAMP DEFAULT NOW()
);

-- OTP Management
otp_codes (
  id: UUID PRIMARY KEY,
  phone_number: VARCHAR NOT NULL,
  code: VARCHAR NOT NULL,
  purpose: ENUM('registration', 'login', 'password_reset') NOT NULL,
  is_used: BOOLEAN DEFAULT FALSE,
  expires_at: TIMESTAMP NOT NULL,
  created_at: TIMESTAMP DEFAULT NOW()
);

-- User Sessions
user_sessions (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  refresh_token: VARCHAR NOT NULL,
  device_info: JSONB,
  ip_address: VARCHAR,
  expires_at: TIMESTAMP NOT NULL,
  created_at: TIMESTAMP DEFAULT NOW()
);

-- AI Insights and Recommendations
ai_insights (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  insight_type: ENUM('spending_pattern', 'goal_recommendation', 'budget_alert', 'saving_tip') NOT NULL,
  title: VARCHAR NOT NULL,
  description: TEXT NOT NULL,
  priority: ENUM('low', 'medium', 'high') DEFAULT 'medium',
  is_read: BOOLEAN DEFAULT FALSE,
  data: JSONB,
  created_at: TIMESTAMP DEFAULT NOW()
);

-- Notifications
notifications (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  type: ENUM('goal_milestone', 'spending_alert', 'weekly_summary', 'educational') NOT NULL,
  title: VARCHAR NOT NULL,
  message: TEXT NOT NULL,
  is_read: BOOLEAN DEFAULT FALSE,
  scheduled_at: TIMESTAMP,
  sent_at: TIMESTAMP,
  created_at: TIMESTAMP DEFAULT NOW()
);

-- System Audit Log
audit_log (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  action: VARCHAR NOT NULL,
  entity_type: VARCHAR NOT NULL,
  entity_id: UUID,
  old_values: JSONB,
  new_values: JSONB,
  ip_address: VARCHAR,
  user_agent: VARCHAR,
  created_at: TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API DESIGN

### Base URL
```
Production: https://api.basira-app.com/v1
Development: http://localhost:3000/v1
```

### Authentication Endpoints
```
POST   /auth/register           # User registration
POST   /auth/verify-otp         # OTP verification
POST   /auth/login              # User login
POST   /auth/refresh            # Refresh access token
POST   /auth/logout             # User logout
POST   /auth/resend-otp         # Resend OTP
POST   /auth/forgot-password    # Password reset request
POST   /auth/reset-password     # Password reset
```

### User Management
```
GET    /users/profile           # Get current user profile
PUT    /users/profile           # Update user profile
GET    /users/profile/history   # Get profile version history
DELETE /users/account           # Delete user account
```

### Onboarding
```
POST   /onboarding/financial-info    # Save monthly income, expenses, etc.
POST   /onboarding/first-goal        # Create first financial goal
GET    /onboarding/status            # Get onboarding completion status
```

### Financial Goals
```
GET    /goals                   # List user's financial goals
POST   /goals                   # Create new financial goal
GET    /goals/:id               # Get specific goal
PUT    /goals/:id               # Update financial goal
DELETE /goals/:id               # Delete financial goal
POST   /goals/:id/transactions  # Add money to goal
GET    /goals/:id/progress      # Get goal progress analytics
```

### Expenses
```
GET    /expenses                # List expenses with pagination/filters
POST   /expenses                # Create new expense
GET    /expenses/:id            # Get specific expense
PUT    /expenses/:id            # Update expense
DELETE /expenses/:id            # Delete expense
POST   /expenses/bulk           # Bulk expense creation
GET    /expenses/categories     # Get expense categories
POST   /expenses/categories     # Create custom category
```

### Analytics & Insights
```
GET    /analytics/spending      # Spending analytics and trends
GET    /analytics/goals         # Goal progress analytics
GET    /analytics/predictions   # Financial predictions
GET    /insights                # AI-generated insights
PUT    /insights/:id/read       # Mark insight as read
```

### Notifications
```
GET    /notifications           # Get user notifications
PUT    /notifications/:id/read  # Mark notification as read
PUT    /notifications/read-all  # Mark all notifications as read
```

---

## 5. AUTHENTICATION FLOW

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    participant SMS

    # Registration Flow
    Client->>API: POST /auth/register {phone, name, birth_date, password}
    API->>DB: Check if phone exists
    API->>DB: Create unverified user
    API->>SMS: Send OTP to phone
    API->>Client: {success: true, message: "OTP sent"}
    
    Client->>API: POST /auth/verify-otp {phone, otp}
    API->>DB: Validate OTP
    API->>DB: Mark user as verified
    API->>Client: {access_token, refresh_token}
    
    # Login Flow
    Client->>API: POST /auth/login {phone, password}
    API->>DB: Validate credentials
    API->>DB: Check if user is verified
    API->>API: Generate JWT tokens
    API->>DB: Store refresh token
    API->>Client: {access_token, refresh_token, user_info}
```

---

## 6. OTP FLOW DESIGN

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Redis
    participant SMS

    Client->>API: Request OTP
    API->>API: Generate 6-digit code
    API->>Redis: Store OTP (5 min expiry)
    API->>SMS: Send OTP to phone
    API->>Client: {success: true}
    
    Client->>API: Submit OTP
    API->>Redis: Validate OTP
    alt OTP Valid
        API->>Redis: Mark OTP as used
        API->>Client: {success: true}
    else OTP Invalid/Expired
        API->>Client: {error: "Invalid OTP"}
    end
```

### OTP Security Features:
- 6-digit numeric codes
- 5-minute expiration
- Single-use only
- Rate limiting: 3 attempts per 15 minutes
- 24-hour phone number cooldown after 5 failed attempts

---

## 7. FOLDER STRUCTURE

```
basira-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── jwt.ts
│   │   └── sms.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── onboarding.controller.ts
│   │   ├── goals.controller.ts
│   │   ├── expenses.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── notifications.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── audit.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── goal.model.ts
│   │   ├── expense.model.ts
│   │   └── notification.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── onboarding.routes.ts
│   │   ├── goals.routes.ts
│   │   ├── expenses.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── notifications.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── otp.service.ts
│   │   ├── sms.service.ts
│   │   ├── encryption.service.ts
│   │   ├── ai.service.ts
│   │   └── analytics.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validation.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   ├── jobs/
│   │   ├── notifications.job.ts
│   │   ├── analytics.job.ts
│   │   └── cleanup.job.ts
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 8. SECURITY IMPLEMENTATION

### Password Security
- bcrypt with 12 rounds minimum
- Password strength validation (min 8 chars, mixed case, numbers, symbols)
- Password history prevention (last 3 passwords)

### JWT Security
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry, single-use, rotation on refresh
- Secure, HttpOnly cookies for web clients
- Device binding for mobile apps

### API Security
- Rate limiting: 100 requests/minute per user
- Request size limits: 10MB max
- CORS configuration for specific origins
- Helmet for security headers
- Input validation and sanitization
- SQL injection prevention via Prisma

### Data Security
- AES-256 encryption for sensitive data at rest
- TLS 1.3 for data in transit
- Database connection encryption
- Secrets management via environment variables
- Regular security audits and dependency updates

---

## 9. ENVIRONMENT VARIABLES

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/basira
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SMS Service
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key

# External Services
AI_SERVICE_URL=your-ai-service-endpoint
AI_SERVICE_API_KEY=your-ai-api-key

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
OTP_EXPIRY_MINUTES=5
```

---

## 10. LOGGING STRATEGY

### Log Levels
- **ERROR**: System errors, exceptions, critical failures
- **WARN**: Performance issues, deprecated API usage
- **INFO**: User actions, business events, API requests
- **DEBUG**: Detailed execution flow (development only)

### Log Structure
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User login successful",
  "userId": "uuid",
  "action": "auth.login",
  "ip": "192.168.1.1",
  "userAgent": "mobile-app/1.0",
  "requestId": "req-uuid",
  "duration": 120
}
```

---

This comprehensive architecture provides a solid foundation for building a scalable, secure, and maintainable backend for the BASIRA application. The design addresses all requirements from the presentation while incorporating modern best practices and production-ready patterns.

Would you like me to proceed with the implementation, or do you have any questions or modifications to the architecture?