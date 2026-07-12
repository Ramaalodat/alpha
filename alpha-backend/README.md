# BASIRA Backend API 🚀

<div dir="rtl">

## نظرة عامة

**BASIRA** هو نظام backend متكامل لتطبيق إرشاد مالي موجه للشباب الأردني (18-30 سنة). يوفر النظام APIs كاملة لإدارة الحسابات، الأهداف المالية، المصروفات، والتحليلات المالية.

### المميزات الرئيسية

- ✅ **نظام مصادقة آمن** - OTP + JWT + Refresh Tokens
- ✅ **إدارة الأهداف المالية** - تتبع الأهداف والتقدم والمعاملات
- ✅ **تتبع المصروفات** - فئات متعددة وإحصائيات شاملة
- ✅ **لوحة تحكم ذكية** - ملخص مالي وتقييم صحة مالية
- ✅ **نظام إشعارات** - إشعارات تلقائية عند الإنجازات
- ✅ **دعم اللغة العربية** - جميع الرسائل والأخطاء بالعربية
- ✅ **Audit Trail كامل** - تسجيل جميع العمليات
- ✅ **Version History** - سجل كامل لتغييرات الملف الشخصي

</div>

---

## 📋 المتطلبات

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14.0
- **npm** or **yarn**

---

## 🚀 التثبيت والتشغيل

### 1. استنساخ المشروع

```bash
git clone https://github.com/your-org/basira-backend.git
cd basira-backend
```

### 2. تثبيت المكتبات

```bash
npm install
```

### 3. إعداد البيئة

```bash
cp .env.example .env
```

قم بتعديل `.env` مع بياناتك:

```env
# App Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/basira

# JWT Secrets (استخدم secrets قوية في الإنتاج)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# SMS Service (for production)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

### 4. إعداد قاعدة البيانات

```bash
# إنشاء الجداول
npx prisma migrate dev

# ملء البيانات الأولية (فئات المصروفات)
npx prisma db seed

# فتح Prisma Studio لعرض البيانات
npx prisma studio
```

### 5. تشغيل السيرفر

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

السيرفر سيعمل على: `http://localhost:3000`

---

## 📚 التوثيق

### وثائق API الكاملة

- **[API Documentation](./API_Documentation.md)** - توثيق شامل لجميع endpoints
- **[Authentication Guide](./AUTH_API_TESTING.md)** - دليل المصادقة والأمان
- **[API Testing Guide](./API_TESTING_GUIDE.md)** - دليل اختبار APIs بأمثلة curl
- **[Phase 3 Complete](./PHASE_3_AUTHENTICATION_COMPLETE.md)** - توثيق نظام المصادقة
- **[Phase 4 Complete](./PHASE_4_COMPLETE_APIs.md)** - توثيق جميع APIs

### Health Check

```bash
curl http://localhost:3000/health
```

### API Root

```bash
curl http://localhost:3000/
```

---

## 🏗️ البنية المعمارية

```
basira-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── migrations/            # Database migrations
├── src/
│   ├── config/
│   │   └── config.ts          # App configuration
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── goal.controller.ts
│   │   ├── expense.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── onboarding.controller.ts
│   │   └── notification.controller.ts
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── otp.service.ts
│   │   ├── user.service.ts
│   │   ├── goal.service.ts
│   │   ├── expense.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── onboarding.service.ts
│   │   └── notification.service.ts
│   ├── middleware/            # Middleware functions
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── request.middleware.ts
│   ├── routes/                # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── goal.routes.ts
│   │   ├── expense.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── onboarding.routes.ts
│   │   └── notification.routes.ts
│   ├── types/                 # TypeScript types
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   └── user.types.ts
│   ├── utils/                 # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── logger.ts
│   └── app.ts                 # App entry point
├── logs/                      # Application logs
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔐 الأمان والمصادقة

### نظام المصادقة

1. **التسجيل**
   - التحقق من رقم الهاتف الأردني (+962)
   - تشفير كلمة المرور (bcrypt - 12 rounds)
   - إرسال OTP للتحقق

2. **OTP Verification**
   - رمز 6 أرقام
   - صلاحية 5 دقائق
   - 3 محاولات كحد أقصى
   - Rate limiting (3 كل 15 دقيقة)

3. **JWT Tokens**
   - Access Token: 15 دقيقة
   - Refresh Token: 7 أيام
   - Token rotation on refresh

4. **Session Management**
   - تتبع الأجهزة
   - إمكانية إلغاء sessions
   - تسجيل IP و User Agent

### ميزات الأمان

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation with Joi
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ Request logging and monitoring
- ✅ Comprehensive audit trail

---

## 📊 قاعدة البيانات

### النماذج الرئيسية

- **Users** - معلومات المستخدمين
- **UserProfile** - الملف المالي مع version history
- **UserSettings** - إعدادات المستخدم
- **FinancialGoal** - الأهداف المالية
- **GoalTransaction** - معاملات الأهداف
- **Expense** - المصروفات
- **ExpenseCategory** - فئات المصروفات
- **Income** - الدخل الشهري
- **Budget** - الميزانيات
- **Notification** - الإشعارات
- **AiInsight** - نصائح AI
- **UserSession** - جلسات المستخدم
- **OtpCode** - رموز OTP
- **AuditLog** - سجل التدقيق
- **UserAchievement** - الإنجازات

### العلاقات

```
User
├── UserProfile (1:many) with version history
├── UserSettings (1:1)
├── FinancialGoal (1:many)
├── Expense (1:many)
├── Income (1:many)
├── Notification (1:many)
├── UserSession (1:many)
└── AuditLog (1:many)

FinancialGoal
└── GoalTransaction (1:many)

Expense
└── ExpenseCategory (many:1)
```

### Migrations

```bash
# إنشاء migration جديد
npx prisma migrate dev --name migration_name

# تطبيق migrations في الإنتاج
npx prisma migrate deploy

# إعادة تعيين قاعدة البيانات
npx prisma migrate reset
```

---

## 🎯 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/verify-phone
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
POST   /api/auth/request-password-reset
POST   /api/auth/reset-password
POST   /api/auth/resend-otp
GET    /api/auth/me
```

### User Management
```
GET    /api/users/profile
PATCH  /api/users/profile
PUT    /api/users/profile/update
GET    /api/users/profile/history
GET    /api/users/settings
PATCH  /api/users/settings
POST   /api/users/change-password
GET    /api/users/stats
DELETE /api/users/account
```

### Onboarding
```
GET    /api/onboarding/status
POST   /api/onboarding/financial-info
POST   /api/onboarding/first-goal
GET    /api/onboarding/recommended-goals
POST   /api/onboarding/skip
```

### Financial Goals
```
POST   /api/goals
GET    /api/goals
GET    /api/goals/:id
PATCH  /api/goals/:id
DELETE /api/goals/:id
POST   /api/goals/:id/transactions
GET    /api/goals/:id/transactions
GET    /api/goals/:id/stats
```

### Expenses
```
GET    /api/expenses/categories
POST   /api/expenses/categories
POST   /api/expenses
GET    /api/expenses
GET    /api/expenses/stats
GET    /api/expenses/monthly-comparison
GET    /api/expenses/:id
PATCH  /api/expenses/:id
DELETE /api/expenses/:id
```

### Dashboard
```
GET    /api/dashboard
GET    /api/dashboard/health-score
```

### Notifications
```
GET    /api/notifications
GET    /api/notifications/unread-count
POST   /api/notifications/read-all
DELETE /api/notifications/read
GET    /api/notifications/:id
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id
```

---

## 🧪 الاختبار

### اختبار يدوي

راجع [API Testing Guide](./API_TESTING_GUIDE.md) لأمثلة curl شاملة.

### اختبار آلي (قريباً)

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### أدوات الاختبار

- **Postman/Insomnia** - لاختبار APIs
- **Prisma Studio** - لفحص قاعدة البيانات
- **PostgreSQL Client** - للاستعلامات المباشرة

---

## 📝 السجلات (Logs)

### مواقع الملفات

```
logs/
├── combined.log    # جميع السجلات
├── error.log       # الأخطاء فقط
└── exceptions.log  # الاستثناءات
```

### عرض السجلات

```bash
# عرض جميع السجلات
tail -f logs/combined.log

# عرض الأخطاء فقط
tail -f logs/error.log

# البحث في السجلات
grep "ERROR" logs/combined.log
```

### مستويات السجلات

- `error` - أخطاء خطيرة
- `warn` - تحذيرات
- `info` - معلومات عامة
- `debug` - معلومات تصحيح (development only)

---

## 🚢 النشر (Deployment)

### متطلبات الإنتاج

1. **PostgreSQL Database**
   - إصدار 14 أو أحدث
   - اتصال SSL مفعّل
   - Backups منتظمة

2. **Environment Variables**
   - استخدام secrets قوية
   - تفعيل HTTPS
   - تحديد CORS origins

3. **SMS Service**
   - إعداد حساب Twilio
   - تفعيل إرسال SMS

### Docker (قريباً)

```bash
# بناء Docker image
docker build -t basira-api .

# تشغيل Container
docker run -p 3000:3000 basira-api
```

### خيارات النشر

- **Heroku** - سهل ومباشر
- **AWS** - Elastic Beanstalk أو EC2
- **DigitalOcean** - App Platform
- **Vercel** - للـ serverless
- **Railway** - بديل سهل

---

## 🔧 إعدادات التطوير

### Scripts المتاحة

```bash
# Development
npm run dev          # تشغيل مع hot reload

# Build
npm run build        # بناء للإنتاج
npm start           # تشغيل الإنتاج

# Database
npm run prisma:studio    # فتح Prisma Studio
npm run prisma:generate  # توليد Prisma Client
npm run prisma:migrate   # تشغيل migrations
npm run prisma:seed      # ملء البيانات الأولية

# Code Quality
npm run lint         # فحص الكود
npm run format       # تنسيق الكود

# Testing (قريباً)
npm test            # تشغيل جميع الاختبارات
npm run test:watch  # وضع المراقبة
```

### VS Code Extensions المقترحة

- Prisma
- ESLint
- Prettier
- REST Client
- GitLens

---

## 🤝 المساهمة

### خطوات المساهمة

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit تغييراتك (`git commit -m 'Add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

### معايير الكود

- استخدام TypeScript
- اتباع ESLint rules
- كتابة تعليقات واضحة
- إضافة tests للميزات الجديدة
- توثيق APIs الجديدة

---

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License - انظر [LICENSE](./LICENSE) للتفاصيل.

---

## 👥 الفريق

**Team Alpha**
- Backend Architecture & Implementation
- Database Design
- API Development
- Security & Authentication

---

## 📞 الدعم

للمساعدة والدعم:
- 📧 Email: support@basira.jo
- 📱 Phone: +962 XX XXX XXXX
- 🌐 Website: https://basira.jo
- 💬 Discord: [Join our server]

---

## 🗺️ خارطة الطريق

### ✅ تم الانتهاء

- [x] نظام المصادقة الكامل
- [x] إدارة المستخدمين
- [x] نظام Onboarding
- [x] إدارة الأهداف المالية
- [x] تتبع المصروفات
- [x] لوحة التحكم
- [x] نظام الإشعارات
- [x] Audit Trail
- [x] توثيق شامل

### 🚧 قيد العمل

- [ ] AI Insights Generation
- [ ] Background Jobs
- [ ] Unit & Integration Tests
- [ ] API Rate Limiting per User
- [ ] Caching Layer (Redis)

### 📅 المستقبل

- [ ] GraphQL API
- [ ] WebSocket للإشعارات الفورية
- [ ] Mobile App Integration
- [ ] Admin Dashboard
- [ ] Advanced Analytics
- [ ] Machine Learning للتوصيات
- [ ] Multi-language Support (EN)
- [ ] Export Reports (PDF)

---

## 🌟 شكر خاص

شكراً لجميع المساهمين والداعمين لمشروع BASIRA!

---

<div align="center">

**صُنع بـ ❤️ في الأردن**

**BASIRA - Your Resilient Partner in Financial Growth**

[Website](https://basira.jo) • [Documentation](./API_Documentation.md) • [Support](mailto:support@basira.jo)

</div>
