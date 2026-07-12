import winston from 'winston';
import config from '../config/config';

// Create logger configuration
const loggerConfig: winston.LoggerOptions = {
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, requestId, userId, action, ...meta }) => {
      const logObject = {
        timestamp,
        level,
        message,
        requestId,
        userId,
        action,
        ...meta
      };
      
      return JSON.stringify(logObject);
    })
  ),
  defaultMeta: {
    service: 'basira-api'
  },
  transports: []
};

// Console transport for development
if (config.app.nodeEnv === 'development') {
  const transports = loggerConfig.transports as winston.transport[];
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, requestId, userId, action, ...meta }) => {
          let logMessage = `${timestamp} [${level}]: ${message}`;
          
          if (requestId) logMessage += ` [requestId: ${requestId}]`;
          if (userId) logMessage += ` [userId: ${userId}]`;
          if (action) logMessage += ` [action: ${action}]`;
          
          // Add meta data if present
          const metaKeys = Object.keys(meta);
          if (metaKeys.length > 0) {
            const metaString = metaKeys
              .map(key => `${key}: ${JSON.stringify(meta[key])}`)
              .join(', ');
            logMessage += ` [${metaString}]`;
          }
          
          return logMessage;
        })
      )
    })
  );
}

// File transport for production
if (config.app.nodeEnv === 'production' || config.logging.file) {
  const transports = loggerConfig.transports as winston.transport[];
  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: parseSize(config.logging.maxSize),
      maxFiles: config.logging.maxFiles,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Error file transport
const transports = loggerConfig.transports as winston.transport[];
transports.push(
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: parseSize(config.logging.maxSize),
    maxFiles: config.logging.maxFiles,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
);

// Create logger instance
export const logger = winston.createLogger(loggerConfig);

// Helper function to parse size strings like "10m", "100k", etc.
function parseSize(size: string): number {
  const match = size.match(/^(\d+)([kmg]?)$/i);
  if (!match) return 10485760; // 10MB default
  
  const num = parseInt(match[1], 10);
  const unit = match[2]?.toLowerCase() || '';
  
  switch (unit) {
    case 'k': return num * 1024;
    case 'm': return num * 1024 * 1024;
    case 'g': return num * 1024 * 1024 * 1024;
    default: return num;
  }
}

// Add custom logging methods for common patterns
export const logWithContext = (
  level: string,
  message: string,
  context: {
    requestId?: string;
    userId?: string;
    action?: string;
    [key: string]: any;
  } = {}
) => {
  logger.log(level, message, context);
};

export const logError = (
  message: string,
  error: Error | unknown,
  context: {
    requestId?: string;
    userId?: string;
    action?: string;
    [key: string]: any;
  } = {}
) => {
  const errorDetails = error instanceof Error ? {
    name: error.name,
    message: error.message,
    stack: error.stack,
  } : { error: String(error) };

  logger.error(message, {
    ...context,
    error: errorDetails,
  });
};

export const logUserAction = (
  action: string,
  userId: string,
  details: any = {},
  requestId?: string
) => {
  logger.info('User action performed', {
    action,
    userId,
    requestId,
    ...details,
  });
};

export const logSecurityEvent = (
  event: string,
  details: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    [key: string]: any;
  }
) => {
  logger.warn('Security event', {
    action: 'security_event',
    event,
    ...details,
  });
};

export const logSystemEvent = (
  event: string,
  details: any = {}
) => {
  logger.info('System event', {
    action: 'system_event',
    event,
    ...details,
  });
};

// Performance logging
export const logPerformance = (
  operation: string,
  duration: number,
  context: {
    requestId?: string;
    userId?: string;
    [key: string]: any;
  } = {}
) => {
  logger.info('Performance metric', {
    action: 'performance',
    operation,
    duration,
    ...context,
  });
};

// Database operation logging
export const logDatabaseOperation = (
  operation: string,
  table: string,
  duration?: number,
  context: {
    requestId?: string;
    userId?: string;
    [key: string]: any;
  } = {}
) => {
  logger.debug('Database operation', {
    action: 'database',
    operation,
    table,
    duration,
    ...context,
  });
};

// API request/response logging
export const logApiRequest = (
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  context: {
    requestId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  } = {}
) => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  
  logger.log(level, 'API request', {
    action: 'api_request',
    method,
    path,
    statusCode,
    duration,
    ...context,
  });
};

// Structured logging for different environments
if (config.app.nodeEnv === 'test') {
  // Suppress logs during testing unless LOG_LEVEL is explicitly set
  if (!process.env.LOG_LEVEL) {
    logger.level = 'error';
  }
}

export default logger;