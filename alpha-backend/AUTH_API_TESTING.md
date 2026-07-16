# Authentication API Testing Guide

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run Prisma migrations
npx prisma migrate dev

# Seed database with default categories
npx prisma db seed
y
# Start development server
npm run dev
```

Server will start at: `http://localhost:3000`

---

## API Endpoints Testing

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Request:**
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

**Expected Response:**
```json
{
  "success": true,
  "message": "تم تسجيل المستخدم بنجاح. تم إرسال رمز التحقق إلى رقم هاتفك",
  "data": {
    "user": {
      "id": "uuid",
      "phoneNumber": "+962791234567",
      "fullName": "أحمد محمد علي",
      "status": "PENDING_VERIFICATION",
      "isOnboarded": false
    },
    "message": "..."
  }
}
```

**Note:** In development mode, the OTP code will be logged to the console.

---

### 2. Verify Phone Number

**Endpoint:** `POST /api/auth/verify-phone`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "otpCode": "123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "تم تفعيل الحساب بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "phoneNumber": "+962791234567",
      "fullName": "أحمد محمد علي",
      "status": "VERIFIED",
      "isOnboarded": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Save the tokens for subsequent requests!**

---

### 3. User Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "password": "SecurePass123",
    "deviceId": "my-device-123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "phoneNumber": "+962791234567",
      "fullName": "أحمد محمد علي",
      "status": "VERIFIED",
      "isOnboarded": false,
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "phoneNumber": "+962791234567",
    "fullName": "أحمد محمد علي",
    "status": "VERIFIED",
    "isOnboarded": false
  }
}
```

---

### 5. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh-token`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "تم تحديث رمز الوصول بنجاح",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 6. Request Password Reset

**Endpoint:** `POST /api/auth/request-password-reset`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق إلى رقم هاتفك",
  "data": {
    "expiresAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

### 7. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "otpCode": "123456",
    "newPassword": "NewSecurePass456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "تم إعادة تعيين كلمة المرور بنجاح"
}
```

---

### 8. Resend OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "purpose": "REGISTRATION"
  }'
```

**Purpose values:** `REGISTRATION`, `LOGIN`, `PASSWORD_RESET`, `PHONE_VERIFICATION`

**Expected Response:**
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق إلى رقم هاتفك",
  "data": {
    "expiresAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

### 9. Logout

**Endpoint:** `POST /api/auth/logout`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "OPTIONAL_REFRESH_TOKEN"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

## Testing Error Cases

### Invalid Phone Number
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

**Expected:** 400 Bad Request with validation error

---

### Weak Password
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

**Expected:** 400 Bad Request with password validation error

---

### Invalid OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+962791234567",
    "otpCode": "999999"
  }'
```

**Expected:** 400 Bad Request - "OTP_INVALID"

---

### Expired Token
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```

**Expected:** 401 Unauthorized - "TOKEN_EXPIRED"

---

### Rate Limit Exceeded
Make more than 3 OTP requests within 15 minutes:

```bash
# Request 1
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+962791234567", "purpose": "REGISTRATION"}'

# Request 2
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+962791234567", "purpose": "REGISTRATION"}'

# Request 3
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+962791234567", "purpose": "REGISTRATION"}'

# Request 4 - Should fail
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+962791234567", "purpose": "REGISTRATION"}'
```

**Expected on 4th request:** 429 Too Many Requests - "OTP_RATE_LIMIT_EXCEEDED"

---

## Postman Collection

### Import this collection into Postman:

```json
{
  "info": {
    "name": "BASIRA Authentication API",
    "description": "Complete authentication endpoints for BASIRA"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"phoneNumber\": \"+962791234567\",\n  \"fullName\": \"أحمد محمد\",\n  \"birthDate\": \"1995-05-15\",\n  \"password\": \"SecurePass123\"\n}"
        },
        "url": "{{baseUrl}}/api/auth/register"
      }
    },
    {
      "name": "Verify Phone",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"phoneNumber\": \"+962791234567\",\n  \"otpCode\": \"123456\"\n}"
        },
        "url": "{{baseUrl}}/api/auth/verify-phone"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"phoneNumber\": \"+962791234567\",\n  \"password\": \"SecurePass123\"\n}"
        },
        "url": "{{baseUrl}}/api/auth/login"
      }
    },
    {
      "name": "Get Current User",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{accessToken}}"}],
        "url": "{{baseUrl}}/api/auth/me"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ]
}
```

---

## Development Tips

### 1. Check Logs
Logs are in `logs/` directory:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

### 2. Check OTP in Console
In development mode, OTP codes are logged:
```
INFO: OTP SMS (DEV MODE) { phoneNumber: '0791234567', code: '123456' }
```

### 3. Database Inspection
```bash
# Open Prisma Studio
npx prisma studio

# Check users
# Check otp_codes table for OTP codes
# Check user_sessions for active sessions
# Check audit_log for all actions
```

### 4. Reset Database
```bash
# Reset and reseed
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Run all migrations
# 3. Run seed script
```

---

## Common Issues

### 1. "Phone number already exists"
- The phone number is already registered
- Use a different phone number or check database

### 2. "OTP_EXPIRED"
- OTP codes expire after 5 minutes
- Request a new OTP with /resend-otp

### 3. "OTP_MAX_ATTEMPTS_EXCEEDED"
- You've tried the wrong OTP 3 times
- Request a new OTP

### 4. "RATE_LIMIT_EXCEEDED"
- Too many requests in short time
- Wait 15 minutes or adjust rate limits

### 5. "TOKEN_EXPIRED"
- Access token expired (15 minutes)
- Use refresh token to get new access token

---

## Security Notes

1. **Never commit .env file** - Contains secrets
2. **Use HTTPS in production** - Secure communication
3. **Rotate JWT secrets regularly** - Security best practice
4. **Monitor rate limits** - Prevent abuse
5. **Review audit logs** - Track all actions
6. **Enable SMS service in production** - Currently logs to console

---

## Next Steps

After testing authentication:
1. Test onboarding flow (coming in Phase 4)
2. Test goal management
3. Test expense tracking
4. Test analytics endpoints

---

**Happy Testing! 🚀**
