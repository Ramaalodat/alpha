import { FastifyRequest, FastifyReply } from 'fastify';
import { achievementService } from '../services/achievement.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';

export class AchievementController {
  async getUserAchievements(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const achievements = await achievementService.getUserAchievements(userId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(achievements));
    } catch (error: any) {
      logger.error('Get user achievements failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async getAchievementSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const summary = await achievementService.getAchievementSummary(userId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(summary));
    } catch (error: any) {
      logger.error('Get achievement summary failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async checkAndUnlock(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { achievementKey, currentValue } = request.body as { achievementKey: string; currentValue: number };

      if (!achievementKey || currentValue === undefined) {
        return reply.status(HTTP_STATUS.BAD_REQUEST).send(createErrorResponse(ErrorCodes.VALIDATION_ERROR, 'achievementKey and currentValue are required'));
      }

      const result = await achievementService.checkAndUnlockAchievements(userId, achievementKey, currentValue);

      if (!result) {
        return reply.status(HTTP_STATUS.NOT_FOUND).send(createErrorResponse(ErrorCodes.NOT_FOUND, 'Achievement definition not found'));
      }

      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(result, 'تم تحديث الإنجاز'));
    } catch (error: any) {
      logger.error('Check achievement failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async initializeAchievements(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const achievements = await achievementService.initializeAchiements(userId);
      return reply.status(HTTP_STATUS.CREATED).send(createSuccessResponse(achievements, 'تم تهيئة الإنجازات'));
    } catch (error: any) {
      logger.error('Initialize achievements failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }
}

export const achievementController = new AchievementController();
