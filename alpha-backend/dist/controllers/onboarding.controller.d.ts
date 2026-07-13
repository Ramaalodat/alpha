import { FastifyRequest, FastifyReply } from 'fastify';
export declare class OnboardingController {
    /**
     * Get onboarding status
     * GET /api/onboarding/status
     */
    getStatus(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Complete financial information step
     * POST /api/onboarding/financial-info
     */
    completeFinancialInfo(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Create first goal
     * POST /api/onboarding/first-goal
     */
    createFirstGoal(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get recommended goals
     * GET /api/onboarding/recommended-goals
     */
    getRecommendedGoals(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Skip onboarding
     * POST /api/onboarding/skip
     */
    skipOnboarding(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const onboardingController: OnboardingController;
//# sourceMappingURL=onboarding.controller.d.ts.map