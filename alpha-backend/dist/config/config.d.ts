/**
 * Configuration Module
 * Centralized configuration management with validation
 * Implements Configuration Management Pattern
 */
/**
 * Application Configuration Interface
 */
interface AppConfig {
    nodeEnv: string;
    port: number;
    host: string;
    apiVersion: string;
    apiPrefix: string;
}
interface DatabaseConfig {
    url: string;
}
interface RedisConfig {
    url: string;
    password: string;
    db: number;
}
interface JwtConfig {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
    audience: string;
}
interface SmsConfig {
    provider: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioPhoneNumber: string;
}
interface OtpConfig {
    length: number;
    expiryMinutes: number;
    maxAttempts: number;
    rateLimitWindow: number;
    dailyLimit: number;
}
interface SecurityConfig {
    encryptionKey: string;
    bcryptRounds: number;
    corsOrigin: string;
    corsCredentials: boolean;
    helmetEnabled: boolean;
}
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    skipSuccessRequests: boolean;
}
interface LoggingConfig {
    level: string;
    file: string;
    maxSize: string;
    maxFiles: number;
}
interface UploadConfig {
    maxSize: number;
    allowedTypes: string[];
    destination: string;
}
interface AiConfig {
    serviceUrl: string;
    apiKey: string;
    model: string;
}
interface BackgroundJobsConfig {
    redisUrl: string;
    concurrency: number;
}
interface MonitoringConfig {
    sentryDsn: string;
    analyticsEnabled: boolean;
}
/**
 * Main Configuration Interface
 */
interface Config {
    app: AppConfig;
    database: DatabaseConfig;
    redis: RedisConfig;
    jwt: JwtConfig;
    sms: SmsConfig;
    otp: OtpConfig;
    security: SecurityConfig;
    rateLimit: RateLimitConfig;
    logging: LoggingConfig;
    upload: UploadConfig;
    ai: AiConfig;
    backgroundJobs: BackgroundJobsConfig;
    monitoring: MonitoringConfig;
}
declare const config: Config;
export default config;
export declare const appConfig: AppConfig;
export declare const databaseConfig: DatabaseConfig;
export declare const redisConfig: RedisConfig;
export declare const jwtConfig: JwtConfig;
export declare const smsConfig: SmsConfig;
export declare const otpConfig: OtpConfig;
export declare const securityConfig: SecurityConfig;
export declare const rateLimitConfig: RateLimitConfig;
export declare const loggingConfig: LoggingConfig;
export declare const uploadConfig: UploadConfig;
export declare const aiConfig: AiConfig;
export declare const backgroundJobsConfig: BackgroundJobsConfig;
export declare const monitoringConfig: MonitoringConfig;
//# sourceMappingURL=config.d.ts.map