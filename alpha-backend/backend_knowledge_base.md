# Full Backend Architecture Intelligence Report

## 0) Executive Summary

- **System type:** Financial guidance backend API (Fastify + TypeScript + Prisma + PostgreSQL)
- **Primary objective:** Manage user onboarding, financial profile, income/expense tracking, goals, budgets, insights, notifications, and achievements.
- **Current maturity:** Strong MVP approaching production readiness, but not enterprise-ready.
- **Observed runtime quality signals:**
  - Build: `npm run build` ✅
  - Tests: `4 passed / 2 failed` ❌
  - Lint: configured script exists but ESLint config missing ❌

---

## 1) Phase 1 - Project Inventory

## 1.1 Root Inventory (backend)

- Folders: `src/`, `prisma/`, `tests/`, `scripts/`, `dist/`, `logs/`, `node_modules/`
- Key files:
  - Runtime/config: `package.json`, `.env`, `.env.example`, `tsconfig.json`
  - Docs: `README.md`, `API_Documentation.md`, `API_TESTING_GUIDE.md`, etc.
  - Legacy artifact: `index.js` (Express + SQLite)
  - DB artifacts: `database.db`, `Database_Schema.sql`

## 1.2 Source Tree (authoritative app code)

```text
src/
├─ app.ts
├─ config/
│  ├─ config.ts
│  ├─ env.validation.ts
│  ├─ security.config.ts
│  └─ swagger.config.ts
├─ controllers/
│  ├─ achievement.controller.ts
│  ├─ auth.controller.ts
│  ├─ budget.controller.ts
│  ├─ dashboard.controller.ts
│  ├─ expense.controller.ts
│  ├─ goal.controller.ts
│  ├─ income.controller.ts
│  ├─ insight.controller.ts
│  ├─ notification.controller.ts
│  ├─ onboarding.controller.ts
│  └─ user.controller.ts
├─ lib/
│  └─ prisma.ts
├─ middleware/
│  ├─ auth.middleware.ts
│  ├─ error.middleware.ts
│  ├─ request.middleware.ts
│  ├─ sanitization.middleware.ts
│  ├─ security-headers.middleware.ts
│  └─ validation.middleware.ts
├─ repositories/
│  ├─ base.repository.ts
│  ├─ index.ts
│  └─ user.repository.ts
├─ routes/
│  ├─ achievement.routes.ts
│  ├─ auth.routes.ts
│  ├─ budget.routes.ts
│  ├─ dashboard.routes.ts
│  ├─ expense.routes.ts
│  ├─ goal.routes.ts
│  ├─ income.routes.ts
│  ├─ insight.routes.ts
│  ├─ notification.routes.ts
│  ├─ onboarding.routes.ts
│  └─ user.routes.ts
├─ services/
│  ├─ achievement.service.ts
│  ├─ auth.service.ts
│  ├─ budget.service.ts
│  ├─ dashboard.service.ts
│  ├─ expense.service.ts
│  ├─ goal.service.ts
│  ├─ income.service.ts
│  ├─ insight.service.ts
│  ├─ notification.service.ts
│  ├─ onboarding.service.ts
│  ├─ otp.service.ts
│  └─ user.service.ts
├─ types/
│  ├─ api.types.ts
│  ├─ auth.types.ts
│  ├─ fastify.d.ts
│  └─ user.types.ts
├─ utils/
│  ├─ AppError.ts
│  ├─ constants.ts
│  ├─ devStore.ts
│  ├─ helpers.ts
│  ├─ logger.ts
│  └─ query.utils.ts
└─ validators/
   ├─ auth.validator.ts
   ├─ base.validator.ts
   └─ onboarding.validator.ts
```

## 1.3 Additional inventories

- Tests: `auth-fallback`, `auth-refresh-fallback`, `dev-store`, `filter-query`, `income.service`, `user-fallback`
- Prisma:
  - `schema.prisma`
  - `seed.ts`
  - Migrations:
    - `20260712145004_init`
    - `20260714000000_add_basira_pdf_fields`
    - `20260714213351_rama`
- Scripts:
  - `debug_logout.js`, `e2e_api_test.js`, `e2e_income_test.js`, `inspect_sessions.js`, `verify_tables.js`
- Jobs/Cron:
  - No active cron scheduler or queue worker registration in runtime.
  - Cleanup/service hooks exist but are not scheduled.

---

## 2) Phase 2 - Domain Analysis

| Domain | Purpose | Main Flow | Files | Dependencies |
|---|---|---|---|---|
| Auth | Identity, session, token lifecycle | register -> verify OTP -> login -> refresh/logout | `auth.routes/controller/service`, `otp.service`, `auth.middleware` | Prisma(User/UserSession/OtpCode), JWT, bcrypt |
| User Profile | Account profile, versioning, preferences | read/update profile, settings, demographics, change password | `user.routes/controller/service` | Prisma(User/UserProfile/UserSettings) |
| Onboarding | Initial financial capture and first-goal activation | status -> financial-info -> first-goal -> mark onboarded | `onboarding.routes/controller/service` | User/Profile/Income/Expense/Goal tables |
| Goals | Savings goals and transaction tracking | create/update goal -> add transactions -> milestones | `goal.routes/controller/service` | FinancialGoal, GoalTransaction, Notification |
| Expenses | Expense ledger and category management | create/read/update/delete expense + stats | `expense.routes/controller/service` | Expense, ExpenseCategory, Budget interactions |
| Income | Income ledger and statistics | CRUD incomes + monthly comparison | `income.routes/controller/service` | Income, AuditLog |
| Budget | Budget envelope and threshold alerts | create -> recalc using expenses -> alert notifications | `budget.routes/controller/service` | Budget, Expense, Notification |
| Dashboard | Aggregated financial snapshot for UI | aggregate goals/expenses/incomes/alerts | `dashboard.routes/controller/service` | multi-table aggregate reads |
| Insights | Rule-based AI-like recommendations | generate -> read/dismiss/act on | `insight.routes/controller/service` | Expense, Goal, UserProfile, AiInsight |
| Notifications | User notification inbox | list/read/delete/unread count | `notification.routes/controller/service` | Notification table |
| Achievements | Gamification and unlocks | initialize -> check/unlock -> summary | `achievement.routes/controller/service` | UserAchievement + Notification |

---

## 3) Phase 3 - Database Analysis (Prisma)

- **Models:** 15
- **Enums:** 16
- **Source:** `prisma/schema.prisma`

## 3.1 Models Overview

1. `User` - core identity and account state
2. `UserProfile` - versioned financial profile
3. `Income` - income records
4. `UserSettings` - preferences and privacy
5. `OtpCode` - OTP issuance/verification state
6. `UserSession` - refresh-token sessions/device tracking
7. `FinancialGoal` - goals ledger
8. `GoalTransaction` - goal deposits/withdrawals
9. `ExpenseCategory` - default/custom categories
10. `Expense` - expense ledger
11. `Budget` - budget envelopes and spent/remaining state
12. `AiInsight` - recommendations/insights
13. `Notification` - user notifications
14. `UserAchievement` - gamification progress
15. `AuditLog` - audit/compliance trail

## 3.2 Per-model details (compressed)

For each model, fields include `id`, ownership (`userId` where relevant), timestamps, and domain-specific fields:

- **User**
  - Key fields: `phoneNumber`, `passwordHash`, `status`, `isOnboarded`, demographics, soft-delete.
  - Relationships: one-to-many with profiles/goals/expenses/income/sessions/otp/insights/notifications/audit/budgets/achievements.
  - Indexes: phone, status, onboarded, createdAt, deletedAt, email, username.

- **UserProfile**
  - Key fields: `monthlyIncome`, `basicExpenses`, `financialGoal`, `relationshipWithMoney`, versioning (`version`, `isCurrent`).
  - Relationship: `user`, `creator`.
  - Indexes: `(userId, isCurrent)`, version, createdAt.

- **Income**
  - Key fields: `amount`, `source`, `frequency`, `incomeDate`, recurring/pinning metadata, soft-delete.
  - Indexes: user/date/active/deleted/sourceType.

- **UserSettings**
  - Key fields: notification toggles, language/currency/timezone, privacy/security preferences.
  - One-to-one with User.

- **OtpCode**
  - Key fields: `phoneNumber`, `code`, `purpose`, `isUsed`, `attempts`, `expiresAt`, request metadata.
  - Indexes: phone, `(code,purpose,isUsed)`, expiresAt.

- **UserSession**
  - Key fields: `refreshTokenHash`, device/ip/ua, active/revoked, expires/lastUsed.
  - Indexes: user, token hash, active, expires, deviceId.

- **FinancialGoal**
  - Key fields: `targetAmount`, `currentAmount`, `targetDate`, status/priority/progress/milestones/flexibility.
  - Relationships: user + goal transactions.
  - Indexes: user, status, targetDate, deletedAt.

- **GoalTransaction**
  - Key fields: amount, type, before/after balances, transaction date.
  - Relationships: user + goal.
  - Indexes: user, goal, transactionDate.

- **ExpenseCategory**
  - Key fields: name/icon/color, default/custom, essential flag, ordering, active.
  - Relationships: expenses + budgets.

- **Expense**
  - Key fields: category, amount, date, method, recurring fields, tags, AI flags, soft-delete.
  - Relationships: user + category.
  - Indexes: user/date/category/recurring/deleted/expenseType.

- **Budget**
  - Key fields: `amount`, `period`, date range, `spent`, `remaining`, alert threshold.
  - Relationships: user + optional category.
  - Indexes: user/category/date-range/active.

- **AiInsight**
  - Key fields: type, title/description (AR/EN), priority, read/dismiss/acted status, expiration.
  - Relationship: user.
  - Indexes: user/read/type/priority/expires.

- **Notification**
  - Key fields: type, message (AR/EN), read/sent state, channels, priority, scheduling.
  - Relationship: user.
  - Indexes: user/read/type/sent/scheduled.

- **UserAchievement**
  - Key fields: achievement key, title/description, target/progress/completion, points.
  - Unique: `(userId, achievementKey)`.

- **AuditLog**
  - Key fields: action, entityType/entityId, old/new values, request context, success/error metadata.
  - Relationship: optional user.
  - Indexes: user, entity, action, createdAt, requestId.

> Deprecated markers: no explicit `@deprecated` flags in schema; deprecation is implicit via legacy artifacts outside Prisma (`index.js`, `database.db`, `Database_Schema.sql`).

---

## 4) Phase 4 - ERD (Textual)

```text
User
├── UserProfile (1:N, versioned; one current)
├── Income (1:N)
├── UserSettings (1:1)
├── OtpCode (1:N optional link)
├── UserSession (1:N)
├── FinancialGoal (1:N)
│   └── GoalTransaction (1:N)
├── Expense (1:N)
│   └── ExpenseCategory (N:1)
├── Budget (1:N)
│   └── ExpenseCategory (N:1 optional)
├── AiInsight (1:N)
├── Notification (1:N)
├── UserAchievement (1:N unique by key)
└── AuditLog (1:N optional user link)
```

---

## 5) Phase 5 - API Catalog

Base prefix: `/api`

### Auth
- `POST /auth/register` (public, validate `registerSchema`) -> `authController.register` -> `authService.register`
- `POST /auth/verify-phone` (public, `verifyPhoneSchema`) -> `authService.verifyPhone`
- `POST /auth/login` (public, `loginSchema`) -> `authService.login`
- `POST /auth/refresh-token` (public, `refreshTokenSchema`) -> `authService.refreshAccessToken`
- `POST /auth/request-password-reset` (public, `requestPasswordResetSchema`) -> `authService.requestPasswordReset`
- `POST /auth/reset-password` (public, `resetPasswordSchema`) -> `authService.resetPassword`
- `POST /auth/resend-otp` (public, `resendOtpSchema`) -> `otpService.generateAndSendOtp`
- `POST /auth/logout` (private) -> `authService.logout`
- `GET /auth/me` (private) -> JWT-derived current user

### Users
- `PATCH /users/demographics` (private, `demographicsSchema`)
- `GET /users/profile` (private)
- `PATCH /users/profile` (private, `updateUserSchema`)
- `GET /users/profile/current` (private)
- `PUT /users/profile/update` (private, `updateProfileSchema`)
- `GET /users/profile/history` (private)
- `GET /users/settings` (private)
- `PATCH /users/settings` (private, `updateSettingsSchema`)
- `POST /users/change-password` (private, `changePasswordSchema`)
- `GET /users/stats` (private)
- `DELETE /users/account` (private; no explicit route-level schema)

### Onboarding
- `GET /onboarding/status` (private + verified)
- `POST /onboarding/financial-info` (`financialInfoSchema`)
- `POST /onboarding/first-goal` (`createFirstGoalSchema`)
- `GET /onboarding/recommended-goals`
- `POST /onboarding/skip`

### Goals
- `POST /goals` (`createGoalSchema`)
- `GET /goals`
- `GET /goals/:goalId`
- `PATCH /goals/:goalId` (`updateGoalSchema`)
- `DELETE /goals/:goalId`
- `POST /goals/:goalId/transactions` (`goalTransactionSchema`)
- `GET /goals/:goalId/transactions`
- `GET /goals/:goalId/stats`

### Expenses
- `GET /expenses/categories` (optional auth)
- `POST /expenses` (`createExpenseSchema`)
- `GET /expenses`
- `GET /expenses/stats`
- `GET /expenses/monthly-comparison`
- `GET /expenses/:expenseId`
- `PATCH /expenses/:expenseId` (`updateExpenseSchema`)
- `DELETE /expenses/:expenseId`
- `POST /expenses/categories` (`createCategorySchema`)

### Incomes
- `POST /incomes` (`createIncomeSchema`)
- `GET /incomes`
- `GET /incomes/stats`
- `GET /incomes/monthly-comparison`
- `GET /incomes/:incomeId`
- `PATCH /incomes/:incomeId` (`updateIncomeSchema`)
- `DELETE /incomes/:incomeId`

### Budgets / Dashboard / Notifications / Insights / Achievements
- Budgets: summary + CRUD + recalc endpoint
- Dashboard: summary + health-score
- Notifications: list/read/read-all/delete/unread-count
- Insights: list/get/read/dismiss/acted/unread-count/generate
- Achievements: list/summary/check/initialize

**API DTO source of truth:** runtime validation schemas in `middleware/validation.middleware.ts` and controller body parsing.

---

## 6) Phase 6 - Service Layer Analysis

| Service | Purpose | Consumed By | Key Dependencies | Key Methods |
|---|---|---|---|---|
| `auth.service` | Registration/login/session/password reset | AuthController, auth middleware | Prisma, JWT, bcrypt, OTP service | `register`, `login`, `verifyPhone`, `refreshAccessToken`, `logout` |
| `otp.service` | OTP generation/verification/rate-limit/SMS | Auth service/controller | Prisma, helpers/constants | `generateOtp`, `verifyOtp`, `checkRateLimit`, `generateAndSendOtp` |
| `user.service` | user profile/settings/account lifecycle | UserController | Prisma, bcrypt, devStore | profile/settings/password/delete/stats |
| `onboarding.service` | onboarding progression and first-goal setup | OnboardingController | Prisma + devStore | status, financial info, first goal, skip, recommendations |
| `goal.service` | goal ledger and transactions | GoalController | Prisma, notifications | create/update/delete, add transaction, stats |
| `expense.service` | expense CRUD, categories, analytics | ExpenseController, app bootstrap | Prisma + constants | CRUD, stats, monthly comparison, `seedDefaultCategories` |
| `income.service` | income CRUD + analytics | IncomeController | Prisma | CRUD, stats, monthly comparison |
| `budget.service` | budget lifecycle and thresholding | BudgetController | Prisma | CRUD, recalc, summary |
| `dashboard.service` | aggregate user financial dashboard | DashboardController | Prisma + helpers + devStore | dashboard summary, health score |
| `insight.service` | generate/manage insights | InsightController | Prisma | list/read/dismiss/generate |
| `notification.service` | notification CRUD/read state | NotificationController | Prisma | list/read/delete + push stub |
| `achievement.service` | gamification rules | AchievementController | Prisma | init/check/unlock/summary |

**Financial impact services:** `expense`, `income`, `goal`, `budget`, `dashboard`, `onboarding`.

---

## 7) Phase 7 - Financial Engine Analysis

### 7.1 Source of Truth

- Financial source tables: `Income`, `Expense`, `FinancialGoal`, `GoalTransaction`, `Budget`, `UserProfile`.
- No dedicated `FinancialCalculationEngine` class; calculations are spread across services.

### 7.2 FinancialCalculationEngine status

- **Not implemented as a dedicated module.**
- Existing calculations are embedded in:
  - `dashboard.service` (monthly summaries, health score)
  - `goal.service` (progress/milestones)
  - `budget.service` (spent/remaining/alert threshold)
  - `income.service` & `expense.service` (aggregations/comparisons)

### 7.3 FinancialSnapshot status

- **No persistent snapshot model** in Prisma.
- Dashboard values are computed on demand from transactional tables.

### 7.4 MoneyHelper status

- **No dedicated money helper** for precision/currency arithmetic.
- Mixed usage of Prisma Decimal + JavaScript `Number` conversions.

### 7.5 Cycle / Goal / Income / Commitment logic

- **Cycle logic:** mostly month-based date windows (`current month`, `last month`) in dashboard/income/expense services.
- **Goal logic:** goal transactions update balance, progress percentage, milestone notifications.
- **Income logic:** records aggregated by date/source with monthly comparisons.
- **Commitment logic:** represented indirectly via budget, recurring fields, fixed/variable expense typing.
- **Currency logic:** currency configured (`JOD`) but no currency conversion engine.

---

## 8) Phase 8 - Request Flow Analysis (Text)

### 8.1 POST /api/auth/login

`Route(auth.routes)` -> `validate(loginSchema)` -> `AuthController.login` -> `AuthService.login` -> `Prisma.user + bcrypt + generateTokenPair + userSession + auditLog` -> standardized API response

### 8.2 POST /api/onboarding/financial-info

`Route(onboarding.routes)` -> `authenticate + requireVerified + validate(financialInfoSchema)` -> `OnboardingController.completeFinancialInfo` -> `OnboardingService._completeFinancialInfoPrisma` -> `UserProfile + Income + Expense + UserSettings + AuditLog` -> response

### 8.3 POST /api/expenses

`Route(expense.routes)` -> `authenticate + requireOnboarding + validate(createExpenseSchema)` -> `ExpenseController.createExpense` -> `ExpenseService.createExpense` -> `Expense + AuditLog` -> response

### 8.4 POST /api/goals/:goalId/transactions

`Route(goal.routes)` -> `authenticate + requireOnboarding + validate(goalTransactionSchema)` -> `GoalController.addTransaction` -> `GoalService.addTransaction` -> `GoalTransaction + FinancialGoal update + optional milestone notification` -> response

### 8.5 POST /api/budgets/:budgetId/recalculate

`Route(budget.routes)` -> auth hooks -> `BudgetController.recalculateBudget` -> `BudgetService.recalculateBudget` -> aggregate expense sum -> update budget spent/remaining/alerted + optional notification -> response

### 8.6 GET /api/dashboard

`Route(dashboard.routes)` -> auth hooks -> `DashboardController.getDashboardSummary` -> `DashboardService.getDashboardSummary` -> multi-query aggregation -> composed dashboard DTO -> response

---

## 9) Phase 9 - Contract Analysis (DTO Drift)

### 9.1 Backend contract sources
- Runtime Joi schemas (`validation.middleware.ts`)
- Controller request body assumptions
- Type interfaces (`types/user.types.ts`, `types/auth.types.ts`)

### 9.2 Frontend (Flutter) contract signals
- `flutter/lib/services/*.dart`
- Main endpoints used: auth/onboarding/expenses/incomes/goals/dashboard/notifications

### 9.3 Contract drift findings

1. **Refresh token response shape drift (Critical)**
   - Flutter expects: `data.tokens.accessToken` and `data.tokens.refreshToken`
   - Backend returns from `authController.refreshToken`: `data = { accessToken, refreshToken }`
2. **Type naming drift in TypeScript auth types**
   - `auth.types.ts` uses snake_case contract interfaces not aligned with runtime camelCase payloads.
3. **Error-handling drift**
   - Flutter `dashboard_service.dart` swallows API/network errors and returns `{}`, masking backend issues.
4. **Validation drift risk**
   - Route-level validation relies on centralized middleware schema; `validators/auth.validator.ts` and `validators/onboarding.validator.ts` are not in request path.

---

## 10) Phase 10 - Dependency / Dead Code Analysis

Potentially unused or dead components:

- `src/middleware/security-headers.middleware.ts` (not registered in `app.ts`)
- `src/repositories/index.ts` and repository layer not used by services/controllers (direct Prisma usage dominates)
- `src/types/auth.types.ts` appears legacy/contract-only and not operationally consumed
- `src/validators/auth.validator.ts`, `src/validators/onboarding.validator.ts` not wired to routes
- Root-level `index.js` is legacy Express+SQLite backend (parallel stack, not active in main TS runtime)

Dependency overhang:

- Package dependencies present but not fully integrated in runtime (`bull`, `node-cron`, `@fastify/redis`).

---

## 11) Phase 11 - Security Audit

Strengths:
- JWT auth + refresh token sessions
- Password hashing (bcrypt)
- OTP verification with attempt/rate-limit checks
- Helmet + CORS + global rate limiting
- Request sanitization middleware (XSS/SQLi heuristics)
- Audit logging across critical operations

Gaps/Risks:
- OTP code returned in API responses (`register`, `resendOtp`) -> security leak for non-dev contexts
- Dev fallback store (`.dev-store.json`) integrated in auth/user/otp paths if DB unavailable
- OptionalAuth silently ignores invalid token (may hide attacks/noise)
- Some error paths return broad 400/500 without strict mapping
- Legacy `index.js` includes hardcoded secret and weak legacy patterns (if accidentally deployed)

---

## 12) Phase 12 - Performance Audit

Positive:
- Good index coverage in Prisma schema
- Aggregation queries use DB aggregate/groupBy in major places
- Soft-delete strategy for large entities

Concerns:
- Dashboard does many parallel queries per request; at scale needs caching/materialized snapshots
- No Redis cache integration actually wired
- No background worker for periodic cleanups (`cleanupExpiredOtps`, `cleanupExpiredInsights`)
- Number/Decimal conversions in JS can cause precision inconsistencies over time

Scalability projection:
- **100k users:** feasible with indexing + query tuning + connection pool + caching.
- **1M users:** requires caching tier, async jobs, read replicas, stronger observability, and denormalized summary/snapshot strategy.

---

## 13) Phase 13 - Technical Debt Audit

### Critical
1. Refresh token contract drift (frontend token refresh parser mismatch)
2. OTP code exposed in API responses
3. Missing lint config despite lint script
4. Failing test suites (auth fallback tests)

### High
5. Financial calculation logic fragmented (no single calculation engine)
6. Dev fallback persistence path coupled with production services
7. Legacy parallel backend (`index.js` + SQLite) in same repository
8. Unused validator/repository/security-header modules increasing maintenance overhead

### Medium
9. Inconsistent type contracts (`auth.types.ts` snake_case vs runtime camelCase)
10. Missing job scheduler/worker despite cleanup methods and job dependencies

### Low
11. Some broad `any` usage across controllers/services
12. Some comments/docs refer to features not fully wired at runtime

---

## 14) Phase 14 - Architecture Assessment

- **Folder structure:** Good modular structure by layer and domain.
- **Layer separation:** Reasonable (routes -> controllers -> services), but service layer still holds mixed concerns.
- **DDD compliance:** Partial; domain language exists, but no strict aggregate boundaries or domain services/events.
- **Maintainability:** Moderate-high with current size; debt rising due duplicate/unused paths.
- **Scalability:** Moderate; requires caching, workers, and calculation centralization for higher scale.
- **Testability:** Moderate-low currently (few tests, failing tests, mixed fallback behavior).

---

## 15) Backend Knowledge Base

### 15.1 System Overview
- Fastify API under `/api` with Swagger at `/api/docs`.
- Prisma PostgreSQL persistence with rich financial schema.
- Arabic-first error/success messages.

### 15.2 Source Of Truth
- Transactional financial truth: `Income`, `Expense`, `FinancialGoal`, `GoalTransaction`, `Budget`, `UserProfile`.

### 15.3 Deployment Notes
- Needs strict production env hardening:
  - disable OTP return in responses
  - disable dev fallback store
  - enforce secrets and SSL DB config
  - add lint/test gates in CI

### 15.4 Known Gaps
- No unified financial calculation engine
- No persisted financial snapshots
- No active background scheduler/queue workers
- Contract mismatch in refresh flow

---

## Final Scoring

- **Backend Health Score:** **68 / 100**
- **Architecture Score:** **74 / 100**
- **Database Score:** **82 / 100**
- **Security Score:** **66 / 100**
- **Performance Score:** **64 / 100**
- **Financial Consistency Score:** **62 / 100**
- **Maintainability Score:** **69 / 100**

## Top 10 Strengths

1. Clear route-controller-service modularity
2. Rich financial domain coverage
3. Strong Prisma schema with relationships/indexes
4. JWT + refresh session model
5. OTP verification workflow
6. Arabic-localized API messaging
7. Swagger/OpenAPI integration
8. Audit logging model and usage
9. Good amount of business features for MVP
10. Build pipeline currently compiles cleanly

## Top 10 Weaknesses

1. Refresh token frontend/backend contract mismatch
2. OTP leakage in API response payload
3. Missing ESLint configuration
4. Failing test suites
5. Fragmented financial computation logic
6. No dedicated snapshot/caching strategy
7. Unused code paths (validators/repositories/middleware)
8. Legacy Express stack still co-located
9. Incomplete operational job scheduling
10. Broad `any` usage in critical paths

## Top 10 Technical Debts

1. Token refresh response shape debt
2. Security debt: OTP in responses
3. QA debt: test failures
4. Tooling debt: lint not operational
5. Domain debt: no centralized financial engine
6. Infra debt: no workers/cron for cleanup tasks
7. Code debt: dead modules not removed
8. Legacy debt: `index.js`/SQLite in same backend
9. Contract debt: duplicate/unused DTO contracts
10. Fallback debt: devStore fallback in core services

---

## Classification

### Current classification: **MVP (advanced), not Production-Ready enterprise**

Reason:
- Functional coverage is broad and architecture is serious enough for MVP/early production pilots.
- However, security hardening gaps, contract drift, lint/test reliability, and missing operational components prevent full production-enterprise readiness.

