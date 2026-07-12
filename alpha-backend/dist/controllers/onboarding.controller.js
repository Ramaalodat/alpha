"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingController = exports.OnboardingController = void 0;
const onboarding_service_1 = require("../services/onboarding.service");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
class OnboardingController {
    /**
     * Get onboarding status
     * GET /api/onboarding/status
     */
    async getStatus(request, reply) {
        try {
            const userId = request.user.userId;
            const status = await onboarding_service_1.onboardingService.getOnboardingStatus(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(status));
        }
        catch (error) {
            logger_1.default.error('Get onboarding status failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Complete financial information step
     * POST /api/onboarding/financial-info
     */
    async completeFinancialInfo(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const result = await onboarding_service_1.onboardingService.completeFinancialInfo({
                userId,
                ...body,
            });
            logger_1.default.info('Financial info completed', { userId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(result, result.message));
        }
        catch (error) {
            logger_1.default.error('Complete financial info failed', { error: error.message, code: error.code });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message, error.details));
        }
    }
    /**
     * Create first goal
     * POST /api/onboarding/first-goal
     */
    async createFirstGoal(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const result = await onboarding_service_1.onboardingService.createFirstGoal({
                userId,
                ...body,
            });
            logger_1.default.info('First goal created', { userId, goalId: result.goal.id });
            return reply
                .status(constants_1.HTTP_STATUS.CREATED)
                .send((0, api_types_1.createSuccessResponse)(result, result.message));
        }
        catch (error) {
            logger_1.default.error('Create first goal failed', { error: error.message, code: error.code });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message, error.details));
        }
    }
    /**
     * Get recommended goals
     * GET /api/onboarding/recommended-goals
     */
    async getRecommendedGoals(request, reply) {
        try {
            const userId = request.user.userId;
            const recommendations = await onboarding_service_1.onboardingService.getRecommendedGoals(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(recommendations));
        }
        catch (error) {
            logger_1.default.error('Get recommended goals failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Skip onboarding
     * POST /api/onboarding/skip
     */
    async skipOnboarding(request, reply) {
        try {
            const userId = request.user.userId;
            const result = await onboarding_service_1.onboardingService.skipOnboarding(userId);
            logger_1.default.info('Onboarding skipped', { userId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(null, result.message));
        }
        catch (error) {
            logger_1.default.error('Skip onboarding failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
}
exports.OnboardingController = OnboardingController;
exports.onboardingController = new OnboardingController();
//# sourceMappingURL=onboarding.controller.js.map