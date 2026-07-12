"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiConfig = exports.swaggerConfig = void 0;
exports.swaggerConfig = {
    openapi: {
        openapi: '3.0.0',
        info: {
            title: 'BASIRA API',
            description: `
# BASIRA - Financial Guidance API

**بصيرة - شريكك المرن في النمو المالي**

BASIRA is a comprehensive financial guidance application designed specifically for Jordanian youth (18-30 years old).
This API provides all the backend functionality needed for personal financial management without requiring bank account integration.

## Features

- 🔐 **Secure Authentication** - OTP-based phone verification with JWT tokens
- 👤 **User Management** - Complete profile and settings management
- 🎯 **Financial Goals** - Track savings goals with transactions and milestones
- 💰 **Expense Tracking** - Categorize and analyze spending patterns
- 📊 **Dashboard Analytics** - Financial health scoring and insights
- 🔔 **Smart Notifications** - Automated alerts for goals and spending
- 📝 **Audit Trail** - Complete history of all user actions
- 🌍 **Arabic Language** - Full RTL support with localized messages

## Authentication

Most endpoints require authentication using JWT tokens. To authenticate:

1. **Register**: \`POST /api/auth/register\` - Create a new account
2. **Verify**: \`POST /api/auth/verify-phone\` - Verify with OTP code
3. **Login**: \`POST /api/auth/login\` - Get access and refresh tokens
4. **Use Token**: Include in header: \`Authorization: Bearer <access_token>\`

## Response Format

All API responses follow a standard format:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "عملية ناجحة",
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
\`\`\`

## Error Handling

Errors follow this format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "رسالة الخطأ بالعربية",
    "details": []
  }
}
\`\`\`

## Rate Limiting

- **Global**: 100 requests per minute
- **Authentication**: 5 requests per 15 minutes
- **OTP Requests**: 3 requests per 15 minutes
      `,
            version: '1.0.0',
            contact: {
                name: 'Team Alpha',
                email: 'support@basira.jo',
                url: 'https://basira.jo',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'https://api.basira.jo',
                description: 'Production server',
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization endpoints',
            },
            {
                name: 'User Management',
                description: 'User profile, settings, and account management',
            },
            {
                name: 'Onboarding',
                description: 'New user onboarding flow and setup',
            },
            {
                name: 'Financial Goals',
                description: 'Savings goals creation, tracking, and transactions',
            },
            {
                name: 'Expense Tracking',
                description: 'Expense management and analytics',
            },
            {
                name: 'Dashboard',
                description: 'Dashboard summaries and financial health metrics',
            },
            {
                name: 'Notifications',
                description: 'User notifications and alerts',
            },
            {
                name: 'Health',
                description: 'System health and monitoring',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT access token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string', example: 'VALIDATION_ERROR' },
                                message: { type: 'string', example: 'رسالة الخطأ' },
                                details: { type: 'array', items: { type: 'object' } },
                            },
                        },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'تمت العملية بنجاح' },
                        data: { type: 'object' },
                        meta: {
                            type: 'object',
                            properties: {
                                requestId: { type: 'string' },
                                timestamp: { type: 'string', format: 'date-time' },
                            },
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        fullName: { type: 'string', example: 'أحمد محمد' },
                        phoneNumber: { type: 'string', example: '+962791234567' },
                        email: { type: 'string', format: 'email', nullable: true },
                        dateOfBirth: { type: 'string', format: 'date' },
                        isPhoneVerified: { type: 'boolean' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                UserProfile: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        currentMonthlyIncome: { type: 'number', example: 500 },
                        currentMonthlySavings: { type: 'number', example: 100 },
                        currentMonthlyExpenses: { type: 'number', example: 400 },
                        financialGoals: { type: 'array', items: { type: 'string' } },
                        riskTolerance: {
                            type: 'string',
                            enum: ['LOW', 'MEDIUM', 'HIGH'],
                            example: 'MEDIUM',
                        },
                        preferredCurrency: { type: 'string', example: 'JOD' },
                        version: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                FinancialGoal: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'شراء سيارة' },
                        targetAmount: { type: 'number', example: 5000 },
                        currentAmount: { type: 'number', example: 1200 },
                        targetDate: { type: 'string', format: 'date' },
                        priority: {
                            type: 'string',
                            enum: ['LOW', 'MEDIUM', 'HIGH'],
                            example: 'HIGH',
                        },
                        status: {
                            type: 'string',
                            enum: ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'],
                            example: 'ACTIVE',
                        },
                        category: { type: 'string', example: 'TRANSPORTATION' },
                        description: { type: 'string' },
                        isPublic: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Expense: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        categoryId: { type: 'string', format: 'uuid' },
                        amount: { type: 'number', example: 25.5 },
                        description: { type: 'string', example: 'غداء في مطعم' },
                        expenseDate: { type: 'string', format: 'date-time' },
                        paymentMethod: {
                            type: 'string',
                            enum: ['CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'DIGITAL_WALLET'],
                            example: 'CASH',
                        },
                        isRecurring: { type: 'boolean' },
                        tags: { type: 'array', items: { type: 'string' } },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        type: {
                            type: 'string',
                            enum: ['GOAL_MILESTONE', 'SPENDING_ALERT', 'SYSTEM', 'ACHIEVEMENT'],
                            example: 'GOAL_MILESTONE',
                        },
                        title: { type: 'string', example: 'تهانينا!' },
                        message: { type: 'string', example: 'لقد وصلت إلى 50% من هدفك' },
                        isRead: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        externalDocs: {
            description: 'Find more information in our documentation',
            url: 'https://docs.basira.jo',
        },
    },
};
exports.swaggerUiConfig = {
    routePrefix: '/api/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        syntaxHighlight: {
            theme: 'monokai',
        },
    },
    uiHooks: {
        onRequest: function (request, reply, next) {
            next();
        },
        preHandler: function (request, reply, next) {
            next();
        },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
        return swaggerObject;
    },
    transformSpecificationClone: true,
};
//# sourceMappingURL=swagger.config.js.map