import { FastifyRequest, FastifyReply } from 'fastify';
import { onboardingService } from '../services/onboarding.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';

export class OnboardingController {
  /**
   * Get onboarding status
   * GET /api/onboarding/status
   */
  async getStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const status = await onboardingService.getOnboardingStatus(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(status));
    } catch (error: any) {
      logger.error('Get onboarding status failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Complete financial information step
   * POST /api/onboarding/financial-info
   */
  async completeFinancialInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as any;

      const result = await onboardingService.completeFinancialInfo({
        userId,
        monthlyIncome: body.monthlyIncome,
        basicExpenses: body.basicExpenses,
        financialGoal: body.financialGoal,
        primarySpendingCategory: body.primarySpendingCategory,
        relationshipWithMoney: body.relationshipWithMoney,
        monthlyExtraSavingsGoal: body.monthlyExtraSavingsGoal,
        mainFinancialGoal12M: body.mainFinancialGoal12M,
        incomeSources: body.incomeSources,
        fixedExpenses: body.fixedExpenses,
        variableExpenses: body.variableExpenses,
        pinnedMonths: body.pinnedMonths,
      });

      logger.info('Financial info completed', { userId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(result, result.message));
    } catch (error: any) {
      logger.error('Complete financial info failed', { error: error.message, code: error.code });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message, error.details));
    }
  }

  /**
   * Create first goal
   * POST /api/onboarding/first-goal
   */
  async createFirstGoal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as {
        icon: string;
        name: string;
        targetAmount: number;
        targetDate: string;
        flexibility?: string;
      };

      const result = await onboardingService.createFirstGoal({
        userId,
        ...body,
      });

      logger.info('First goal created', { userId, goalId: result.goal.id });

      return reply
        .status(HTTP_STATUS.CREATED)
        .send(createSuccessResponse(result, result.message));
    } catch (error: any) {
      logger.error('Create first goal failed', { error: error.message, code: error.code });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message, error.details));
    }
  }

  /**
   * Get recommended goals
   * GET /api/onboarding/recommended-goals
   */
  async getRecommendedGoals(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const recommendations = await onboardingService.getRecommendedGoals(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(recommendations));
    } catch (error: any) {
      logger.error('Get recommended goals failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Skip onboarding
   * POST /api/onboarding/skip
   */
  async skipOnboarding(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const result = await onboardingService.skipOnboarding(userId);

      logger.info('Onboarding skipped', { userId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Skip onboarding failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }
}

export const onboardingController = new OnboardingController();
