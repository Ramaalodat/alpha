"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingService = exports.OnboardingService = void 0;
const client_1 = require("@prisma/client");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class OnboardingService {
    /**
     * Get onboarding status for user
     */
    async getOnboardingStatus(userId) {
        // Check if user exists and is verified
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profiles: {
                    where: { isCurrent: true },
                    take: 1,
                },
                goals: {
                    where: { deletedAt: null },
                    take: 1,
                },
            },
        });
        if (!user) {
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: 'المستخدم غير موجود',
            };
        }
        // Check onboarding steps
        const hasFinancialInfo = user.profiles.length > 0;
        const hasFirstGoal = user.goals.length > 0;
        const isCompleted = user.isOnboarded;
        // Determine next step
        let nextStep = null;
        if (!hasFinancialInfo) {
            nextStep = 'financial_info';
        }
        else if (!hasFirstGoal) {
            nextStep = 'first_goal';
        }
        return {
            isCompleted,
            steps: {
                financialInfo: hasFinancialInfo,
                firstGoal: hasFirstGoal,
            },
            nextStep,
        };
    }
    /**
     * Complete financial information step
     */
    async completeFinancialInfo(params) {
        const { userId, monthlyIncome, basicExpenses, financialGoal, primarySpendingCategory } = params;
        // Check if user already has a profile
        const existingProfile = await prisma.userProfile.findFirst({
            where: { userId, isCurrent: true },
        });
        if (existingProfile) {
            throw {
                code: api_types_1.ErrorCodes.CONFLICT,
                message: 'تم إكمال هذه الخطوة مسبقاً',
            };
        }
        // Validate financial data
        if (monthlyIncome <= 0 || basicExpenses < 0) {
            throw {
                code: api_types_1.ErrorCodes.INVALID_AMOUNT,
                message: constants_1.ERROR_MESSAGES.INVALID_AMOUNT,
            };
        }
        if (basicExpenses > monthlyIncome) {
            logger_1.default.warn('Basic expenses exceed monthly income', {
                userId,
                monthlyIncome,
                basicExpenses,
            });
            // This is a warning, not an error - user might have other income sources
        }
        // Create user profile
        const profile = await prisma.userProfile.create({
            data: {
                userId,
                monthlyIncome,
                basicExpenses,
                financialGoal,
                primarySpendingCategory,
                version: 1,
                isCurrent: true,
                createdBy: userId,
            },
        });
        // Create default settings if not exists
        const existingSettings = await prisma.userSettings.findUnique({
            where: { userId },
        });
        if (!existingSettings) {
            await prisma.userSettings.create({
                data: {
                    userId,
                    // Default settings (as defined in constants)
                    notificationsEnabled: true,
                    pushNotifications: true,
                    smsNotifications: true,
                    weeklySummary: true,
                    spendingAlerts: true,
                    language: 'ar',
                    currency: 'JOD',
                    timezone: 'Asia/Amman',
                },
            });
        }
        // Create audit log
        await this.createAuditLog({
            userId,
            action: 'CREATE',
            entityType: 'UserProfile',
            entityId: profile.id,
            newValues: profile,
        });
        logger_1.default.info('Financial information completed', { userId, profileId: profile.id });
        return {
            profile,
            message: 'تم حفظ المعلومات المالية بنجاح',
        };
    }
    /**
     * Create first goal and complete onboarding
     */
    async createFirstGoal(params) {
        const { userId, icon, name, targetAmount, targetDate } = params;
        // Check if user has completed financial info step
        const profile = await prisma.userProfile.findFirst({
            where: { userId, isCurrent: true },
        });
        if (!profile) {
            throw {
                code: api_types_1.ErrorCodes.ONBOARDING_INCOMPLETE,
                message: 'يجب إكمال المعلومات المالية أولاً',
            };
        }
        // Check if user already has a goal
        const existingGoal = await prisma.financialGoal.findFirst({
            where: { userId, deletedAt: null },
        });
        if (existingGoal) {
            throw {
                code: api_types_1.ErrorCodes.CONFLICT,
                message: 'تم إنشاء هدف مسبقاً',
            };
        }
        // Validate goal data
        if (targetAmount <= 0) {
            throw {
                code: api_types_1.ErrorCodes.INVALID_AMOUNT,
                message: constants_1.ERROR_MESSAGES.INVALID_AMOUNT,
            };
        }
        const targetDateObj = new Date(targetDate);
        if (targetDateObj <= new Date()) {
            throw {
                code: api_types_1.ErrorCodes.INVALID_DATE_RANGE,
                message: 'يجب أن يكون التاريخ المستهدف في المستقبل',
            };
        }
        // Create financial goal
        const goal = await prisma.financialGoal.create({
            data: {
                userId,
                icon,
                name,
                targetAmount,
                targetDate: targetDateObj,
                currentAmount: 0,
                status: 'ACTIVE',
                progressPercentage: 0,
            },
        });
        // Mark user as onboarded
        await prisma.user.update({
            where: { id: userId },
            data: { isOnboarded: true },
        });
        // Create audit log for goal
        await this.createAuditLog({
            userId,
            action: 'CREATE',
            entityType: 'FinancialGoal',
            entityId: goal.id,
            newValues: goal,
        });
        // Create audit log for onboarding completion
        await this.createAuditLog({
            userId,
            action: 'UPDATE',
            entityType: 'User',
            entityId: userId,
            newValues: { isOnboarded: true },
        });
        logger_1.default.info('First goal created - onboarding completed', {
            userId,
            goalId: goal.id,
        });
        return {
            goal,
            message: 'تم إنشاء الهدف المالي بنجاح. مرحباً بك في BASIRA!',
        };
    }
    /**
     * Skip onboarding and mark as complete (optional feature)
     */
    async skipOnboarding(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: 'المستخدم غير موجود',
            };
        }
        if (user.isOnboarded) {
            throw {
                code: api_types_1.ErrorCodes.ONBOARDING_ALREADY_COMPLETE,
                message: constants_1.ERROR_MESSAGES.ONBOARDING_COMPLETE,
            };
        }
        // Mark as onboarded
        await prisma.user.update({
            where: { id: userId },
            data: { isOnboarded: true },
        });
        // Create audit log
        await this.createAuditLog({
            userId,
            action: 'UPDATE',
            entityType: 'User',
            entityId: userId,
            newValues: { isOnboarded: true, skipped: true },
        });
        logger_1.default.info('Onboarding skipped', { userId });
        return {
            message: 'تم تخطي عملية التسجيل',
        };
    }
    /**
     * Get recommended financial goals based on user profile
     */
    async getRecommendedGoals(userId) {
        // Get user profile
        const profile = await prisma.userProfile.findFirst({
            where: { userId, isCurrent: true },
        });
        if (!profile) {
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: 'الملف الشخصي غير موجود',
            };
        }
        const monthlyIncome = Number(profile.monthlyIncome);
        const basicExpenses = Number(profile.basicExpenses);
        const disposableIncome = monthlyIncome - basicExpenses;
        // Generate recommendations based on financial situation
        const recommendations = [
            {
                icon: '🏦',
                category: 'emergency_fund',
                name: 'صندوق الطوارئ',
                suggestedAmount: Math.round(basicExpenses * 6), // 6 months of expenses
                reasoning: 'يُنصح بتوفير ما يعادل 6 أشهر من المصاريف الأساسية',
            },
            {
                icon: '💰',
                category: 'savings',
                name: 'الادخار الشهري',
                suggestedAmount: Math.round(disposableIncome * 0.2 * 12), // 20% of disposable income for a year
                reasoning: 'ادخر 20% من دخلك الصافي شهرياً',
            },
            {
                icon: '🏠',
                category: 'large_purchase',
                name: 'مشروع كبير',
                suggestedAmount: Math.round(monthlyIncome * 12), // 1 year of income
                reasoning: 'خطط لشراء كبير أو استثمار مستقبلي',
            },
            {
                icon: '✈️',
                category: 'travel',
                name: 'رحلة أو سفر',
                suggestedAmount: Math.round(monthlyIncome * 2), // 2 months of income
                reasoning: 'خطط لرحلة أو تجربة جديدة',
            },
        ];
        return {
            categoryRecommendations: recommendations,
        };
    }
    /**
     * Create audit log entry
     */
    async createAuditLog(data) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    entityType: data.entityType,
                    entityId: data.entityId,
                    oldValues: data.oldValues,
                    newValues: data.newValues,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to create audit log', { error });
        }
    }
}
exports.OnboardingService = OnboardingService;
exports.onboardingService = new OnboardingService();
//# sourceMappingURL=onboarding.service.js.map