import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import config from './config/config';
import { swaggerConfig, swaggerUiConfig } from './config/swagger.config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestIdMiddleware, requestLogger } from './middleware/request.middleware';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { onboardingRoutes } from './routes/onboarding.routes';
import { goalRoutes } from './routes/goal.routes';
import { expenseRoutes } from './routes/expense.routes';
import { incomeRoutes } from './routes/income.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { notificationRoutes } from './routes/notification.routes';

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

  // CORS
  await fastify.register(fastifyCors, {
    origin: config.security.corsOrigin,
    credentials: config.security.corsCredentials,
  });

  // Security headers
  await fastify.register(fastifyHelmet, {
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
  await fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

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
    await registerPlugins();
    await registerMiddleware();
    await registerRoutes();

    // Start server
    await fastify.listen({
      port: config.app.port,
      host: config.app.host,
    });

    logger.info(`🚀 Server listening on ${config.app.host}:${config.app.port}`);
    logger.info(`📚 Environment: ${config.app.nodeEnv}`);
    logger.info(`🔐 Authentication: Enabled`);
    logger.info(`📊 Database: PostgreSQL with Prisma`);
    logger.info(`📖 API Documentation: http://${config.app.host}:${config.app.port}/api/docs`);
  } catch (err) {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  try {
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
