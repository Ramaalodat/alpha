"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingRoutes = void 0;
const onboarding_controller_1 = require("../controllers/onboarding.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const onboardingRoutes = async (fastify) => {
    // All routes require authentication and verified account
    fastify.addHook('onRequest', auth_middleware_1.authenticate);
    fastify.addHook('onRequest', auth_middleware_1.requireVerified);
    /**
     * @route   GET /api/onboarding/status
     * @desc    Get onboarding status
     * @access  Private
     */
    fastify.get('/status', onboarding_controller_1.onboardingController.getStatus);
    /**
     * @route   POST /api/onboarding/financial-info
     * @desc    Complete financial information step
     * @access  Private
     */
    fastify.post('/financial-info', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.financialInfoSchema)],
    }, onboarding_controller_1.onboardingController.completeFinancialInfo);
    /**
     * @route   POST /api/onboarding/first-goal
     * @desc    Create first goal
     * @access  Private
     */
    fastify.post('/first-goal', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.createFirstGoalSchema)],
    }, onboarding_controller_1.onboardingController.createFirstGoal);
    /**
     * @route   GET /api/onboarding/recommended-goals
     * @desc    Get recommended goals
     * @access  Private
     */
    fastify.get('/recommended-goals', onboarding_controller_1.onboardingController.getRecommendedGoals);
    /**
     * @route   POST /api/onboarding/skip
     * @desc    Skip onboarding
     * @access  Private
     */
    fastify.post('/skip', onboarding_controller_1.onboardingController.skipOnboarding);
};
exports.onboardingRoutes = onboardingRoutes;
//# sourceMappingURL=onboarding.routes.js.map