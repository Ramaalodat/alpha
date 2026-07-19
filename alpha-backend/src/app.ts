import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import config from './config/config';
import { swaggerConfig, swaggerUiConfig } from './config/swagger.config';
import { helmetConfig, corsConfig, rateLimitConfig } from './config/security.config';
import { validateEnv, checkSecurityConfig, displayEnvConfig } from './config/env.validation';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestIdMiddleware, requestLogger } from './middleware/request.middleware';
import { securityMiddleware } from './middleware/sanitization.middleware';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { onboardingRoutes } from './routes/onboarding.routes';
import { goalRoutes } from './routes/goal.routes';
import { expenseRoutes } from './routes/expense.routes';
import { incomeRoutes } from './routes/income.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { notificationRoutes } from './routes/notification.routes';
import { budgetRoutes } from './routes/budget.routes';
import { insightRoutes } from './routes/insight.routes';
import { achievementRoutes } from './routes/achievement.routes';
import prisma from './lib/prisma';
import { expenseService } from './services/expense.service';
import { allocationRoutes } from './routes/allocation.routes';
import { cycleRoutes } from './routes/cycle.routes';
import { transactionRoutes } from './routes/transaction.routes';
import { commitmentRoutes } from './routes/commitment.routes';
import { CronManager } from './jobs/cron.manager';

const fastify = Fastify({
  logger: false, // Using custom Winston logger
  trustProxy: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
});

// Register plugins
const registerPlugins = async () => {
  // Swagger/OpenAPI - Register first to document all routes
  await fastify.register(fastifySwagger, swaggerConfig);
  await fastify.register(fastifySwaggerUi, swaggerUiConfig);

  // CORS - use comprehensive security config
  await fastify.register(fastifyCors, corsConfig);

  // Security headers - use comprehensive helmet config
  await fastify.register(fastifyHelmet, helmetConfig);

  // Rate limiting - use comprehensive rate limit config
  await fastify.register(fastifyRateLimit, rateLimitConfig);

  // JWT
  await fastify.register(fastifyJwt, {
    secret: config.jwt.accessTokenSecret,
  });

  logger.info('All plugins registered successfully');
};

// Register middleware
const registerMiddleware = async () => {
  // Request ID and logging
  fastify.addHook('onRequest', requestIdMiddleware);
  fastify.addHook('onRequest', requestLogger);

  // Security middleware (sanitization, SQL injection, XSS detection, content-type validation)
  fastify.addHook('onRequest', securityMiddleware);

  logger.info('All middleware registered successfully');
};

// Register routes
const registerRoutes = async () => {
  // API v1 routes
  await fastify.register(
    async (instance) => {
      // Auth routes (public + private)
      await instance.register(authRoutes, { prefix: '/auth' });
      
      // User management routes
      await instance.register(userRoutes, { prefix: '/users' });
      
      // Onboarding routes
      await instance.register(onboardingRoutes, { prefix: '/onboarding' });
      
      // Financial goal routes
      await instance.register(goalRoutes, { prefix: '/goals' });
      
      // Expense tracking routes
      await instance.register(expenseRoutes, { prefix: '/expenses' });

      // Income tracking routes
      await instance.register(incomeRoutes, { prefix: '/incomes' });
      
      // Dashboard routes
      await instance.register(dashboardRoutes, { prefix: '/dashboard' });
      
      // Notification routes
      await instance.register(notificationRoutes, { prefix: '/notifications' });

      // Allocation and Cycle routes
      await instance.register(allocationRoutes, { prefix: '/allocations' });
      await instance.register(cycleRoutes, { prefix: '/cycles' });

      // Transaction routes
      await instance.register(transactionRoutes, { prefix: '/transactions' });

      // Commitment routes
      await instance.register(commitmentRoutes, { prefix: '/commitments' });

      // Budget routes
      await instance.register(budgetRoutes, { prefix: '/budgets' });

      // AI Insights routes
      await instance.register(insightRoutes, { prefix: '/insights' });

      // Achievement routes
      await instance.register(achievementRoutes, { prefix: '/achievements' });
    },
    { prefix: '/api' }
  );

  logger.info('All routes registered successfully');
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
    environment: config.app.nodeEnv,
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
fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

// Initialize server
const start = async () => {
  try {
    // Validate environment variables
    const env = validateEnv();
    checkSecurityConfig(env);
    displayEnvConfig(env);

    await registerPlugins();
    await registerMiddleware();
    await registerRoutes();

    // Seed default expense categories on startup
    await expenseService.seedDefaultCategories();

    // Start server
    await fastify.listen({
      port: config.app.port,
      host: config.app.host,
    });

    // Start Cron Jobs
    CronManager.startAll();

    logger.info(`🚀 Server listening on ${config.app.host}:${config.app.port}`);
    logger.info(`📚 Environment: ${config.app.nodeEnv}`);
    logger.info(`🔐 Authentication: Enabled`);
    logger.info(`📊 Database: PostgreSQL with Prisma`);
    logger.info(`📖 API Documentation: http://${config.app.host}:${config.app.port}/api/docs`);
  } catch (err: any) {
    console.error('SERVER START ERROR:', err);
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  try {
    // Disconnect Prisma
    await prisma.$disconnect();
    logger.info('Database disconnected');

    await fastify.close();
    logger.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', { error: err });
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, promise });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  gracefulShutdown();
});

// Start the server
if (require.main === module) {
  start();
}

export default fastify;
export { start };
