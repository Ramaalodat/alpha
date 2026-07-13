# BASIRA API - Complete Examples Guide 📚

Real-world examples for every API endpoint with curl, JavaScript, and response examples.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication Flow](#authentication-flow)
3. [User Management](#user-management)
4. [Onboarding](#onboarding)
5. [Financial Goals](#financial-goals)
6. [Expense Tracking](#expense-tracking)
7. [Dashboard](#dashboard)
8. [Notifications](#notifications)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## Getting Started

### Base URL

```
Development: http://localhost:3000
Production:  https://api.basira.jo
```

### Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "تمت العملية بنجاح",
  "data": { },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-06-15T12:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "بيانات غير صحيحة",
    "details": [
      {
        "field": "phoneNumber",
        "message": "رقم الهاتف غير صحيح"
      }
    ]
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-06-15T12:30:00.000Z"
  }
}
```

---

## Authentication Flow

### 1. Register New User

Register a new account with phone number.

**Endpoint:** `POST /api/auth/register`

**Request:**

<function_calls>
<invoke name="bash">
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "أحمد محمد علي",
    "phoneNumber": "+962791234567",
    "password": "SecurePass123!",
    "dateOfBirth": "2000-01-15"
  }'