/**
 * Fastify Type Extensions
 * Extends Fastify types with custom properties
 */

import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      phoneNumber: string;
      fullName: string;
      status: string;
      isOnboarded: boolean;
    };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      userId: string;
      phoneNumber: string;
      fullName: string;
      status: string;
      isOnboarded: boolean;
    };
  }
}
