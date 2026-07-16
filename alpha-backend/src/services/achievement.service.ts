import { UserAchievement } from '@prisma/client';
import { ErrorCodes } from '../types/api.types';
import logger from '../utils/logger';
import prisma from '../lib/prisma';

/**
 * Achievement definitions
 * Each achievement has a key, title, description, icon, and target
 */
const ACHIEVEMENT_DEFINITIONS = [
  { key: 'FIRST_GOAL', title: 'First Step', titleAr: 'الخطوة الأولى', description: 'Create your first financial goal', descriptionAr: 'أنشئ أول هدف مالي', icon: '🎯', target: 1 },
  { key: 'FIVE_GOALS', title: 'Goal Setter', titleAr: 'صاحب أهداف', description: 'Create 5 financial goals', descriptionAr: 'أنشئ 5 أهداف مالية', icon: '🏆', target: 5 },
  { key: 'FIRST_SAVING', title: 'Saver', titleAr: 'مدخر', description: 'Make your first deposit', descriptionAr: 'قم بأول إيداع', icon: '💰', target: 1 },
  { key: 'TEN_TRANSACTIONS', title: 'Consistent Saver', titleAr: 'مدخر منتظم', description: 'Complete 10 transactions', descriptionAr: 'أكمل 10 معاملات', icon: '📊', target: 10 },
  { key: 'GOAL_COMPLETED', title: 'Goal Crusher', titleAr: 'محقق الأهداف', description: 'Complete your first goal', descriptionAr: 'حقق هدفك الأول', icon: '🎉', target: 1 },
  { key: 'THREE_MONTHS', title: 'Committed', titleAr: 'ملتزم', description: 'Use the app for 3 months', descriptionAr: 'استخدم التطبيق لمدة 3 أشهر', icon: '📅', target: 90 },
  { key: 'BUDGET_MASTER', title: 'Budget Master', titleAr: 'خبير ميزانية', description: 'Create your first budget', descriptionAr: 'أنشئ ميزانيتك الأولى', icon: '📋', target: 1 },
  { key: 'EMERGENCY_FUND', title: 'Safety Net', titleAr: 'شبكة أمان', description: 'Set up emergency fund goal', descriptionAr: 'أنشئ هدف صندوق الطوارئ', icon: '🛡️', target: 1 },
];

export class AchievementService {
  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return prisma.userAchievement.findMany({
      where: { userId },
      orderBy: [{ isCompleted: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get user achievement summary
   */
  async getAchievementSummary(userId: string): Promise<{
    totalAchievements: number;
    completedAchievements: number;
    totalPoints: number;
    completionPercentage: number;
    achievements: UserAchievement[];
  }> {
    const achievements = await this.getUserAchievements(userId);

    const completed = achievements.filter(a => a.isCompleted);
    const totalPoints = completed.reduce((sum, a) => sum + a.pointsEarned, 0);
    const total = Math.max(achievements.length, ACHIEVEMENT_DEFINITIONS.length);

    return {
      totalAchievements: total,
      completedAchievements: completed.length,
      totalPoints,
      completionPercentage: total > 0 ? Math.round((completed.length / total) * 100) : 0,
      achievements,
    };
  }

  /**
   * Check and unlock achievements based on user activity
   */
  async checkAndUnlockAchievements(userId: string, achievementKey: string, currentValue: number): Promise<UserAchievement | null> {
    const definition = ACHIEVEMENT_DEFINITIONS.find(a => a.key === achievementKey);
    if (!definition) return null;

    // Find or create achievement record
    let achievement = await prisma.userAchievement.findFirst({
      where: { userId, achievementKey },
    });

    if (!achievement) {
      achievement = await prisma.userAchievement.create({
        data: {
          userId,
          achievementKey: definition.key,
          title: definition.title,
          titleAr: definition.titleAr,
          description: definition.description,
          descriptionAr: definition.descriptionAr,
          icon: definition.icon,
          target: definition.target,
          progress: 0,
          pointsEarned: 0,
        },
      });
    }

    // Skip if already completed
    if (achievement.isCompleted) return achievement;

    // Update progress
    const progress = Math.min(currentValue, definition.target);
    const isCompleted = progress >= definition.target;
    const pointsEarned = isCompleted ? 100 : 0;

    const updated = await prisma.userAchievement.update({
      where: { id: achievement.id },
      data: {
        progress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        pointsEarned,
      },
    });

    // Create notification if achievement unlocked
    if (isCompleted && !achievement.isCompleted) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'EDUCATIONAL',
          title: `Achievement Unlocked: ${definition.titleAr}`,
          titleAr: `إنجاز جديد: ${definition.titleAr}`,
          message: `Congratulations! You've earned ${pointsEarned} points.`,
          messageAr: `تهانينا! لقد ربحت ${pointsEarned} نقطة.`,
          channels: ['push', 'app'],
          priority: 'HIGH',
          data: { achievementKey, pointsEarned },
        },
      });

      logger.info('Achievement unlocked', { userId, achievementKey, pointsEarned });
    }

    return updated;
  }

  /**
   * Initialize all achievements for a new user
   */
  async initializeAchiements(userId: string): Promise<UserAchievement[]> {
    const existing = await prisma.userAchievement.count({ where: { userId } });
    if (existing > 0) return [];

    const achievements: UserAchievement[] = [];

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      const achievement = await prisma.userAchievement.create({
        data: {
          userId,
          achievementKey: def.key,
          title: def.title,
          titleAr: def.titleAr,
          description: def.description,
          descriptionAr: def.descriptionAr,
          icon: def.icon,
          target: def.target,
          progress: 0,
          pointsEarned: 0,
        },
      });
      achievements.push(achievement);
    }

    logger.info('Achievements initialized', { userId, count: achievements.length });
    return achievements;
  }
}

export const achievementService = new AchievementService();
