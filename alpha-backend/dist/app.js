"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const config_1 = __importDefault(require("./config/config"));
const swagger_config_1 = require("./config/swagger.config");
const logger_1 = __importDefault(require("./utils/logger"));
const error_middleware_1 = require("./middleware/error.middleware");
const request_middleware_1 = require("./middleware/request.middleware");
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const onboarding_routes_1 = require("./routes/onboarding.routes");
const goal_routes_1 = require("./routes/goal.routes");
const expense_routes_1 = require("./routes/expense.routes");
const income_routes_1 = require("./routes/income.routes");
const dashboard_routes_1 = require("./routes/dashboard.routes");
const notification_routes_1 = require("./routes/notification.routes");
const fastify = (0, fastify_1.default)({
    logger: false, // Using custom Winston logger
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
});
// Register plugins
const registerPlugins = async () => {
    // Swagger/OpenAPI - Register first to document all routes
    await fastify.register(swagger_1.default, swagger_config_1.swaggerConfig);
    await fastify.register(swagger_ui_1.default, swagger_config_1.swaggerUiConfig);
    // CORS
    await fastify.register(cors_1.default, {
        origin: config_1.default.security.corsOrigin,
        credentials: config_1.default.security.corsCredentials,
    });
    // Security headers
    await fastify.register(helmet_1.default, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
    });
    // Rate limiting
    await fastify.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '1 minute',
    });
    // JWT
    await fastify.register(jwt_1.default, {
        secret: config_1.default.jwt.accessTokenSecret,
    });
    logger_1.default.info('All plugins registered successfully');
};
// Register middleware
const registerMiddleware = async () => {
    // Request ID and logging
    fastify.addHook('onRequest', request_middleware_1.requestIdMiddleware);
    fastify.addHook('onRequest', request_middleware_1.requestLogger);
    logger_1.default.info('All middleware registered successfully');
};
// Register routes
const registerRoutes = async () => {
    // API v1 routes
    await fastify.register(async (instance) => {
        // Auth routes (public + private)
        await instance.register(auth_routes_1.authRoutes, { prefix: '/auth' });
        // User management routes
        await instance.register(user_routes_1.userRoutes, { prefix: '/users' });
        // Onboarding routes
        await instance.register(onboarding_routes_1.onboardingRoutes, { prefix: '/onboarding' });
        // Financial goal routes
        await instance.register(goal_routes_1.goalRoutes, { prefix: '/goals' });
        // Expense tracking routes
        await instance.register(expense_routes_1.expenseRoutes, { prefix: '/expenses' });
        // Income tracking routes
        await instance.register(income_routes_1.incomeRoutes, { prefix: '/incomes' });
        // Dashboard routes
        await instance.register(dashboard_routes_1.dashboardRoutes, { prefix: '/dashboard' });
        // Notification routes
        await instance.register(notification_routes_1.notificationRoutes, { prefix: '/notifications' });
    }, { prefix: '/api' });
    logger_1.default.info('All routes registered successfully');
};
// Health check endpoint
fastify.get('/health', {
    schema: {
        tags: ['Health'],
        description: 'System health check',
        response: {
            200: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number', description: 'Server uptime in seconds' },
                    environment: { type: 'string', example: 'development' },
                },
            },
        },
    },
}, async (request, reply) => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.default.app.nodeEnv,
    };
});
// Root endpoint
fastify.get('/', {
    schema: {
        tags: ['Health'],
        description: 'API root information',
        response: {
            200: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'BASIRA API' },
                    version: { type: 'string', example: '1.0.0' },
                    description: { type: 'string' },
                    status: { type: 'string', example: 'running' },
                    docs: { type: 'string', example: '/api/docs' },
                },
            },
        },
    },
}, async (request, reply) => {
    return {
        name: 'BASIRA API',
        version: '1.0.0',
        description: 'Financial guidance application for Jordanian youth',
        status: 'running',
        docs: '/api/docs',
    };
});
// Register error handlers
fastify.setErrorHandler(error_middleware_1.errorHandler);
fastify.setNotFoundHandler(error_middleware_1.notFoundHandler);
// Initialize server
const start = async () => {
    try {
        await registerPlugins();
        await registerMiddleware();
        await registerRoutes();
        // Start server
        await fastify.listen({
            port: config_1.default.app.port,
            host: config_1.default.app.host,
        });
        logger_1.default.info(`🚀 Server listening on ${config_1.default.app.host}:${config_1.default.app.port}`);
        logger_1.default.info(`📚 Environment: ${config_1.default.app.nodeEnv}`);
        logger_1.default.info(`🔐 Authentication: Enabled`);
        logger_1.default.info(`📊 Database: PostgreSQL with Prisma`);
        logger_1.default.info(`📖 API Documentation: http://${config_1.default.app.host}:${config_1.default.app.port}/api/docs`);
    }
    catch (err) {
        logger_1.default.error('Failed to start server', { error: err });
        process.exit(1);
    }
};
exports.start = start;
// Graceful shutdown
const gracefulShutdown = async () => {
    logger_1.default.info('Received shutdown signal, closing server gracefully...');
    try {
        await fastify.close();
        logger_1.default.info('Server closed successfully');
        process.exit(0);
    }
    catch (err) {
        logger_1.default.error('Error during shutdown', { error: err });
        process.exit(1);
    }
};
// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Promise Rejection', { reason, promise });
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception', { error: error.message, stack: error.stack });
    gracefulShutdown();
});
// Start the server
if (require.main === module) {
    start();
}
exports.default = fastify;
//# sourceMappingURL=app.js.map