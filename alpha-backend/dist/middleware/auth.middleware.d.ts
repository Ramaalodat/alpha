import { FastifyRequest, FastifyReply } from 'fastify';
declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            userId: string;
            phoneNumber: string;
            fullName: string;
            status: string;
            isOnboarded: boolean;
        };
        requestId?: string;
    }
}
/**
 * Middleware to authenticate JWT token
 */
export declare const authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Middleware to check if user has completed onboarding
 */
export declare const requireOnboarding: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Middleware to check if user account is verified
 */
export declare const requireVerified: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Optional authentication - attaches user if token is present but doesn't fail if absent
 */
export declare const optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
/**
 * Extract request metadata for logging and audit
 */
export declare const extractRequestMetadata: (request: FastifyRequest) => {
    ipAddress: string;
    userAgent: string;
    method: string;
    url: string;
    requestId: string;
};
//# sourceMappingURL=auth.middleware.d.ts.map