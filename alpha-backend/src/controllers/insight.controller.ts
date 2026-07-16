import { FastifyRequest, FastifyReply } from 'fastify';
import { insightService } from '../services/insight.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';

export class InsightController {
  async getUserInsights(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const query = request.query as any;

      const result = await insightService.getUserInsights(userId, query);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(result.data));
    } catch (error: any) {
      logger.error('Get user insights failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async getInsightById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { insightId } = request.params as { insightId: string };

      const insight = await insightService.getInsightById(userId, insightId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(insight));
    } catch (error: any) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send(createErrorResponse(error.code || ErrorCodes.NOT_FOUND, error.message));
    }
  }

  async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { insightId } = request.params as { insightId: string };

      const insight = await insightService.markAsRead(userId, insightId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(insight, 'تم قراءة النصيحة'));
    } catch (error: any) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send(createErrorResponse(error.code || ErrorCodes.NOT_FOUND, error.message));
    }
  }

  async dismissInsight(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { insightId } = request.params as { insightId: string };

      await insightService.dismissInsight(userId, insightId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(null, 'تم إخفاء النصيحة'));
    } catch (error: any) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send(createErrorResponse(error.code || ErrorCodes.NOT_FOUND, error.message));
    }
  }

  async markAsActedOn(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { insightId } = request.params as { insightId: string };

      const insight = await insightService.markAsActedOn(userId, insightId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(insight, 'تم تنفيذ النصيحة'));
    } catch (error: any) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send(createErrorResponse(error.code || ErrorCodes.NOT_FOUND, error.message));
    }
  }

  async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const count = await insightService.getUnreadCount(userId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse({ count }));
    } catch (error: any) {
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async generateInsights(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const insights = await insightService.generateInsights(userId);
      return reply.status(HTTP_STATUS.CREATED).send(createSuccessResponse(insights, 'تم إنشاء النصائح'));
    } catch (error: any) {
      logger.error('Generate insights failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }
}

export const insightController = new InsightController();
