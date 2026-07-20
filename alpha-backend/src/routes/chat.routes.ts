import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { chatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireOnboarded } from '../middleware/onboarding.middleware';

export const chatRoutes = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
  // All chat routes require authentication
  fastify.addHook('onRequest', authenticate);
  // fastify.addHook('onRequest', requireOnboarded); // Optional depending on if they can chat before onboarding

  fastify.post(
    '/message',
    {
      schema: {
        tags: ['Chat'],
        description: 'Send a message to the AI Chatbot and return the response',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  n8nResponse: { type: 'object', additionalProperties: true },
                  sentPayload: { type: 'object', additionalProperties: true }
                }
              }
            }
          }
        }
      }
    },
    chatController.sendMessage.bind(chatController)
  );
};
