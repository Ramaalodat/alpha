import winston from 'winston';
export declare const logger: winston.Logger;
export declare const logWithContext: (level: string, message: string, context?: {
    requestId?: string;
    userId?: string;
    action?: string;
    [key: string]: any;
}) => void;
export declare const logError: (message: string, error: Error | unknown, context?: {
    requestId?: string;
    userId?: string;
    action?: string;
    [key: string]: any;
}) => void;
export declare const logUserAction: (action: string, userId: string, details?: any, requestId?: string) => void;
export declare const logSecurityEvent: (event: string, details: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    [key: string]: any;
}) => void;
export declare const logSystemEvent: (event: string, details?: any) => void;
export declare const logPerformance: (operation: string, duration: number, context?: {
    requestId?: string;
    userId?: string;
    [key: string]: any;
}) => void;
export declare const logDatabaseOperation: (operation: string, table: string, duration?: number, context?: {
    requestId?: string;
    userId?: string;
    [key: string]: any;
}) => void;
export declare const logApiRequest: (method: string, path: string, statusCode: number, duration: number, context?: {
    requestId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
}) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map