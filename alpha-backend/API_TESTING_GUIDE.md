# دليل اختبار APIs - BASIRA Backend

## 🚀 البدء السريع

```bash
# تثبيت المكتبات
npm install

# إعداد قاعدة البيانات
npx prisma migrate dev
npx prisma db seed

# تشغيل السيرفر
npm run dev
```

السيرفر سيعمل على: `http://localhost:3000`

---

## 📋 سيناريو الاختبار الكامل

### 1️⃣ التسجيل والتحقق

#### **1.1 - تسجيل مستخدم جديد**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "fullName": "أحمد محمد علي",
    "birthDate": "1995-05-15",
    "password": "SecurePass123"
  }'
```

**الرد المتوقع:**
```json
{
  "success": true,
  "message": "تم تسجيل المستخدم بنجاح. تم إرسال رمز التحقق إلى رقم هاتفك",
  "data": {
    "user": {
      "id": "uuid",
      "phoneNumber": "+962791234567",
      "status": "PENDING_VERIFICATION"
    }
  }
}
```

**ملاحظة:** في وضع التطوير، ستجد رمز OTP في console logs.

#### **1.2 - التحقق من رقم الهاتف**

```bash
curl -X POST http://localhost:3000/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "otpCode": "123456"
  }'
```

**احفظ الـ tokens من الرد!**

```json
{
  "success": true,
  "data": {
    "user": {...},
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

---

### 2️⃣ تسجيل الدخول

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "password": "SecurePass123"
  }'
```

---

### 3️⃣ عملية Onboarding

#### **3.1 - الحصول على حالة Onboarding**

```bash
curl -X GET http://localhost:3000/api/onboarding/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **3.2 - إكمال المعلومات المالية**

```bash
curl -X POST http://localhost:3000/api/onboarding/financial-info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyIncome": 1200.00,
    "basicExpenses": 600.00,
    "financialGoal": "بناء صندوق طوارئ",
    "primarySpendingCategory": "Food & Dining"
  }'
```

#### **3.3 - الحصول على الأهداف المقترحة**

```bash
curl -X GET http://localhost:3000/api/onboarding/recommended-goals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **3.4 - إنشاء أول هدف مالي**

```bash
curl -X POST http://localhost:3000/api/onboarding/first-goal \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "icon": "🏠",
    "name": "دفعة أولى لشقة",
    "targetAmount": 5000.00,
    "targetDate": "2025-12-31"
  }'
```

**بعد هذه الخطوة، يكتمل Onboarding ويصبح الحساب جاهزاً!**

---

### 4️⃣ إدارة الملف الشخصي

#### **4.1 - عرض الملف الشخصي**

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **4.2 - تحديث المعلومات الأساسية**

```bash
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "أحمد محمد علي السيد"
  }'
```

#### **4.3 - تحديث الملف المالي (ينشئ نسخة جديدة)**

```bash
curl -X PUT http://localhost:3000/api/users/profile/update \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyIncome": 1500.00,
    "basicExpenses": 700.00,
    "occupation": "مهندس برمجيات",
    "familySize": 3,
    "hasEmergencyFund": true,
    "changeReason": "زيادة الراتب"
  }'
```

#### **4.4 - عرض سجل التغييرات**

```bash
curl -X GET http://localhost:3000/api/users/profile/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **4.5 - عرض الإعدادات**

```bash
curl -X GET http://localhost:3000/api/users/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **4.6 - تحديث الإعدادات**

```bash
curl -X PATCH http://localhost:3000/api/users/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationsEnabled": true,
    "language": "ar",
    "weeklySummary": true,
    "spendingAlerts": true
  }'
```

#### **4.7 - تغيير كلمة المرور**

```bash
curl -X POST http://localhost:3000/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
  }'
```

#### **4.8 - إحصائيات المستخدم**

```bash
curl -X GET http://localhost:3000/api/users/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5️⃣ إدارة الأهداف المالية

#### **5.1 - إنشاء هدف جديد**

```bash
curl -X POST http://localhost:3000/api/goals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "icon": "✈️",
    "name": "رحلة صيفية إلى أوروبا",
    "description": "زيارة 3 دول أوروبية",
    "targetAmount": 3000.00,
    "targetDate": "2025-07-01",
    "category": "travel",
    "priority": "MEDIUM"
  }'
```

#### **5.2 - عرض جميع الأهداف**

```bash
# جميع الأهداف
curl -X GET http://localhost:3000/api/goals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# أهداف نشطة فقط
curl -X GET "http://localhost:3000/api/goals?status=ACTIVE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **5.3 - عرض تفاصيل هدف**

```bash
curl -X GET http://localhost:3000/api/goals/GOAL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **5.4 - تحديث هدف**

```bash
curl -X PATCH http://localhost:3000/api/goals/GOAL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAmount": 3500.00,
    "priority": "HIGH"
  }'
```

#### **5.5 - إضافة إيداع للهدف**

```bash
curl -X POST http://localhost:3000/api/goals/GOAL_ID/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200.00,
    "transactionType": "DEPOSIT",
    "description": "ادخار شهري"
  }'
```

#### **5.6 - سحب من الهدف**

```bash
curl -X POST http://localhost:3000/api/goals/GOAL_ID/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "transactionType": "WITHDRAWAL",
    "description": "سحب طارئ"
  }'
```

#### **5.7 - عرض معاملات الهدف**

```bash
curl -X GET http://localhost:3000/api/goals/GOAL_ID/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **5.8 - إحصائيات الهدف**

```bash
curl -X GET http://localhost:3000/api/goals/GOAL_ID/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**الرد يتضمن:**
- إجمالي الإيداعات والسحوبات
- عدد المعاملات
- متوسط الإيداع
- الأيام المتبقية
- الادخار الشهري المطلوب
- هل على المسار الصحيح

#### **5.9 - حذف هدف**

```bash
curl -X DELETE http://localhost:3000/api/goals/GOAL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6️⃣ إدارة المصروفات

#### **6.1 - عرض الفئات**

```bash
# عام (لا يحتاج authentication)
curl -X GET http://localhost:3000/api/expenses/categories

# مع الفئات المخصصة للمستخدم
curl -X GET http://localhost:3000/api/expenses/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **6.2 - إنشاء فئة مخصصة**

```bash
curl -X POST http://localhost:3000/api/expenses/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "الاستثمارات",
    "icon": "📈",
    "color": "#10B981"
  }'
```

#### **6.3 - إضافة مصروف**

```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "CATEGORY_UUID",
    "amount": 45.50,
    "description": "عشاء مع الأصدقاء",
    "expenseDate": "2024-01-15",
    "paymentMethod": "CARD",
    "location": "مطعم النخيل",
    "tags": ["طعام", "اجتماعي"],
    "notes": "احتفال بعيد ميلاد"
  }'
```

#### **6.4 - عرض جميع المصروفات**

```bash
# جميع المصروفات
curl -X GET http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# مع فلاتر
curl -X GET "http://localhost:3000/api/expenses?startDate=2024-01-01&endDate=2024-01-31&categoryId=CATEGORY_UUID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **6.5 - تفاصيل مصروف**

```bash
curl -X GET http://localhost:3000/api/expenses/EXPENSE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **6.6 - تحديث مصروف**

```bash
curl -X PATCH http://localhost:3000/api/expenses/EXPENSE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "description": "عشاء مع العائلة"
  }'
```

#### **6.7 - حذف مصروف**

```bash
curl -X DELETE http://localhost:3000/api/expenses/EXPENSE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **6.8 - إحصائيات المصروفات**

```bash
curl -X GET "http://localhost:3000/api/expenses/stats?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**الرد يتضمن:**
- إجمالي المصروفات
- عدد المصروفات
- متوسط المصروف
- حسب الفئة (مع النسب المئوية)
- حسب طريقة الدفع
- المتوسط اليومي

#### **6.9 - مقارنة شهرية**

```bash
curl -X GET http://localhost:3000/api/expenses/monthly-comparison \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**الرد يتضمن:**
- مصروفات الشهر الحالي
- مصروفات الشهر الماضي
- نسبة التغيير
- الاتجاه (زيادة/نقصان/ثابت)

---

### 7️⃣ لوحة التحكم (Dashboard)

#### **7.1 - ملخص شامل**

```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**الرد يتضمن:**
```json
{
  "success": true,
  "data": {
    "user": {
      "fullName": "أحمد محمد",
      "monthlyIncome": 1200.00,
      "basicExpenses": 600.00
    },
    "goals": {
      "totalGoals": 3,
      "activeGoals": 2,
      "completedGoals": 1,
      "totalSaved": 2500.00,
      "totalTarget": 10000.00,
      "overallProgress": 25.00
    },
    "expenses": {
      "monthlyExpenses": 450.00,
      "topCategory": "Food & Dining",
      "remainingBudget": 150.00
    },
    "recentActivity": {
      "recentExpenses": [...],
      "recentGoalTransactions": [...],
      "unreadNotifications": 5,
      "newInsights": 2
    }
  }
}
```

#### **7.2 - درجة الصحة المالية**

```bash
curl -X GET http://localhost:3000/api/dashboard/health-score \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**الرد يتضمن:**
```json
{
  "success": true,
  "data": {
    "score": 75,
    "breakdown": {
      "savings": 80,
      "budgetAdherence": 85,
      "goalProgress": 65,
      "emergencyFund": 100
    },
    "recommendations": [
      "حاول زيادة معدل الادخار الشهري",
      "ركز على تحقيق أهدافك المالية"
    ]
  }
}
```

---

### 8️⃣ الإشعارات

#### **8.1 - عرض جميع الإشعارات**

```bash
# جميع الإشعارات
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# غير المقروءة فقط
curl -X GET "http://localhost:3000/api/notifications?isRead=false" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **8.2 - عدد غير المقروءة**

```bash
curl -X GET http://localhost:3000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **8.3 - تفاصيل إشعار**

```bash
curl -X GET http://localhost:3000/api/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **8.4 - تحديد كمقروء**

```bash
curl -X PATCH http://localhost:3000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **8.5 - تحديد الكل كمقروء**

```bash
curl -X POST http://localhost:3000/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **8.6 - حذف إشعار**

```bash
curl -X DELETE http://localhost:3000/api/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### **8.7 - حذف جميع المقروءة**

```bash
curl -X DELETE http://localhost:3000/api/notifications/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9️⃣ تحديث Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

### 🔟 تسجيل الخروج

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 🧪 اختبار حالات الخطأ

### 1. رقم هاتف غير صحيح

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "123456",
    "fullName": "Test User",
    "birthDate": "1995-05-15",
    "password": "SecurePass123"
  }'
```

**متوقع:** 400 - خطأ في التحقق

### 2. كلمة مرور ضعيفة

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "fullName": "Test User",
    "birthDate": "1995-05-15",
    "password": "weak"
  }'
```

**متوقع:** 400 - كلمة المرور ضعيفة

### 3. OTP خاطئ

```bash
curl -X POST http://localhost:3000/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "otpCode": "999999"
  }'
```

**متوقع:** 400 - رمز التحقق غير صحيح

### 4. Token منتهي الصلاحية

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```

**متوقع:** 401 - Token expired

### 5. محاولة الوصول بدون إكمال Onboarding

```bash
curl -X GET http://localhost:3000/api/goals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**متوقع:** 403 - يجب إكمال عملية التسجيل

### 6. تجاوز حد الطلبات (Rate Limiting)

قم بإرسال أكثر من 3 طلبات OTP خلال 15 دقيقة:

```bash
# طلب 1
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+962791234567", "purpose": "REGISTRATION"}'

# طلب 2
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+962791234567", "purpose": "REGISTRATION"}'

# طلب 3
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+962791234567", "purpose": "REGISTRATION"}'

# طلب 4 - يجب أن يفشل
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+962791234567", "purpose": "REGISTRATION"}'
```

**متوقع في الطلب الرابع:** 429 - تم تجاوز الحد المسموح

---

## 📊 Postman Collection

يمكنك استيراد هذه المجموعة إلى Postman:

### المتغيرات البيئية
```json
{
  "baseUrl": "http://localhost:3000",
  "accessToken": "",
  "refreshToken": "",
  "userId": "",
  "goalId": "",
  "expenseId": "",
  "categoryId": ""
}
```

### مثال على طلب
```json
{
  "name": "Login",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"phoneNumber\": \"+962791234567\",\n  \"password\": \"SecurePass123\"\n}"
    },
    "url": {
      "raw": "{{baseUrl}}/api/auth/login",
      "host": ["{{baseUrl}}"],
      "path": ["api", "auth", "login"]
    }
  }
}
```

---

## 🔍 فحص قاعدة البيانات

### استخدام Prisma Studio

```bash
npx prisma studio
```

سيفتح واجهة ويب على `http://localhost:5555`

يمكنك من خلالها:
- عرض جميع البيانات
- تعديل البيانات
- فحص العلاقات
- التحقق من الـ audit logs

### استعلامات SQL مباشرة

```bash
# الدخول إلى PostgreSQL
psql -U postgres -d basira

# عرض المستخدمين
SELECT id, phone_number, full_name, status, is_onboarded FROM users;

# عرض OTP codes
SELECT phone_number, code, purpose, is_used, expires_at FROM otp_codes ORDER BY created_at DESC LIMIT 10;

# عرض الأهداف المالية
SELECT u.full_name, g.name, g.target_amount, g.current_amount, g.progress_percentage, g.status 
FROM financial_goals g 
JOIN users u ON g.user_id = u.id 
WHERE g.deleted_at IS NULL;

# عرض audit log
SELECT action, entity_type, created_at, success FROM audit_log ORDER BY created_at DESC LIMIT 20;
```

---

## 🐛 تصحيح الأخطاء

### 1. فحص Logs

```bash
# عرض جميع logs
tail -f logs/combined.log

# عرض errors فقط
tail -f logs/error.log

# البحث عن خطأ معين
grep "OTP" logs/combined.log
```

### 2. فحص OTP في Console

في وضع التطوير، يظهر OTP في console:

```
INFO: OTP SMS (DEV MODE) {
  phoneNumber: '0791234567',
  code: '123456',
  message: 'رمز التحقق الخاص بك في BASIRA هو: 123456'
}
```

### 3. إعادة تعيين قاعدة البيانات

```bash
npx prisma migrate reset
```

هذا سيقوم بـ:
1. حذف قاعدة البيانات
2. تشغيل جميع migrations
3. تشغيل seed script

---

## ⚡ نصائح الأداء

### 1. استخدام HTTP/2
قم بتفعيل HTTP/2 في Fastify لتحسين الأداء

### 2. Batch Requests
قم بتجميع الطلبات المتعددة في طلب واحد عندما يكون ذلك ممكناً

### 3. Cache المتكرر
استخدم الـ cache للبيانات التي لا تتغير كثيراً (مثل فئات المصروفات)

### 4. Pagination
استخدم pagination للقوائم الطويلة

---

## 🎯 سيناريوهات اختبار متقدمة

### السيناريو 1: المستخدم الجديد الكامل

1. تسجيل حساب جديد
2. التحقق من الهاتف
3. إكمال معلومات onboarding
4. إنشاء هدف مالي
5. إضافة مصروفات
6. إضافة إيداع للهدف
7. فحص dashboard

### السيناريو 2: إدارة متعددة للأهداف

1. إنشاء 3 أهداف مختلفة
2. إضافة معاملات لكل هدف
3. تحديث حالة أحد الأهداف
4. حذف هدف
5. فحص الإحصائيات

### السيناريو 3: تتبع المصروفات الشهري

1. إضافة 20 مصروف مختلف
2. تصنيفها في فئات مختلفة
3. إنشاء فئة مخصصة
4. فحص الإحصائيات
5. المقارنة الشهرية

---

## 📝 ملاحظات مهمة

1. **Development Mode**: جميع OTP codes تظهر في console
2. **Token Expiry**: Access token ينتهي بعد 15 دقيقة، استخدم refresh token
3. **Rate Limiting**: انتبه لحدود الطلبات (3 OTP كل 15 دقيقة)
4. **Soft Delete**: البيانات المحذوفة لا تُحذف فعلياً، فقط يتم تعيين `deletedAt`
5. **Audit Trail**: كل عملية يتم تسجيلها في audit_log
6. **Profile Versions**: كل تحديث للملف الشخصي ينشئ نسخة جديدة

---

## 🚀 الاختبارات الآلية (قريباً)

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

**تم إنشاؤه بواسطة فريق BASIRA - دليلك المالي الموثوق** 🚀
