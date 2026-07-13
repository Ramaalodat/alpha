import { UserProfile, FinancialGoal } from '@prisma/client';
import { OnboardingStatus } from '../types/user.types';
interface CompleteFinancialInfoParams {
    userId: string;
    monthlyIncome: number;
    basicExpenses: number;
    financialGoal: string;
    primarySpendingCategory: string;
}
interface CreateFirstGoalParams {
    userId: string;
    icon: string;
    name: string;
    targetAmount: number;
    targetDate: string;
}
export declare class OnboardingService {
    /**
     * Get onboarding status for user
     */
    getOnboardingStatus(userId: string): Promise<OnboardingStatus>;
    /**
     * Complete financial information step
     */
    completeFinancialInfo(params: CompleteFinancialInfoParams): Promise<{
        profile: UserProfile;
        message: string;
    }>;
    /**
     * Create first goal and complete onboarding
     */
    createFirstGoal(params: CreateFirstGoalParams): Promise<{
        goal: FinancialGoal;
        message: string;
    }>;
    /**
     * Skip onboarding and mark as complete (optional feature)
     */
    skipOnboarding(userId: string): Promise<{
        message: string;
    }>;
    /**
     * Get recommended financial goals based on user profile
     */
    getRecommendedGoals(userId: string): Promise<{
        categoryRecommendations: Array<{
            icon: string;
            category: string;
            name: string;
            suggestedAmount: number;
            reasoning: string;
        }>;
    }>;
    /**
     * Create audit log entry
     */
    private createAuditLog;
}
export declare const onboardingService: OnboardingService;
export {};
//# sourceMappingURL=onboarding.service.d.ts.map