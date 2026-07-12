/**
 * Validate environment variables
 */
export declare const validateEnv: () => {
    [key: string]: any;
};
/**
 * Check for weak secrets in production
 */
export declare const checkSecurityConfig: (env: any) => void;
/**
 * Mask sensitive environment variables in logs
 */
export declare const maskSensitiveEnv: (env: any) => any;
/**
 * Generate secure random string for secrets
 */
export declare const generateSecureSecret: (length?: number) => string;
/**
 * Display environment configuration on startup
 */
export declare const displayEnvConfig: (env: any) => void;
declare const _default: {
    validate: () => {
        [key: string]: any;
    };
    checkSecurity: (env: any) => void;
    mask: (env: any) => any;
    display: (env: any) => void;
    generateSecret: (length?: number) => string;
};
export default _default;
//# sourceMappingURL=env.validation.d.ts.map