import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // =============================================
  // 1. Seed Default Expense Categories
  // =============================================
  console.log('📁 Seeding expense categories...');

  // Fixed Expense Categories (isEssential: true)
  const fixedCategories = [
    { name: 'Tuition', nameAr: 'رسوم دراسية', icon: '🎓', color: '#3B82F6', isDefault: true, isEssential: true, displayOrder: 1 },
    { name: 'Rent', nameAr: 'إيجار المنزل', icon: '🏠', color: '#DC2626', isDefault: true, isEssential: true, displayOrder: 2 },
    { name: 'Loan Installment', nameAr: 'قسط التمويل', icon: '💳', color: '#7C3AED', isDefault: true, isEssential: true, displayOrder: 3 },
    { name: 'Utilities', nameAr: 'فواتير الخدمات', icon: '💡', color: '#F59E0B', isDefault: true, isEssential: true, displayOrder: 4 },
    { name: 'Treatment', nameAr: 'علاج', icon: '🏥', color: '#EC4899', isDefault: true, isEssential: true, displayOrder: 5 },
    { name: 'Savings', nameAr: 'الادخار', icon: '💰', color: '#22C55E', isDefault: true, isEssential: true, displayOrder: 6 },
    { name: 'Other Fixed', nameAr: 'أخرى (ثابتة)', icon: '📋', color: '#6B7280', isDefault: true, isEssential: true, displayOrder: 7 },
  ];

  // Variable Expense Categories (isEssential: false)
  const variableCategories = [
    { name: 'Food', nameAr: 'الطعام', icon: '🍽️', color: '#F97316', isDefault: true, isEssential: false, displayOrder: 8 },
    { name: 'Transportation', nameAr: 'المواصلات', icon: '🚗', color: '#3B82F6', isDefault: true, isEssential: false, displayOrder: 9 },
    { name: 'Clothing & Accessories', nameAr: 'ملابس وأحذية وحقائب', icon: '👔', color: '#8B5CF6', isDefault: true, isEssential: false, displayOrder: 10 },
    { name: 'Events & Occasions', nameAr: 'أعياد ومناسبات خاصة', icon: '🎉', color: '#E11D48', isDefault: true, isEssential: false, displayOrder: 11 },
    { name: 'Entertainment', nameAr: 'ترفيه', icon: '🎮', color: '#10B981', isDefault: true, isEssential: false, displayOrder: 12 },
    { name: 'Treatment & Rehab', nameAr: 'علاج وتأهيل', icon: '💊', color: '#14B8A6', isDefault: true, isEssential: false, displayOrder: 13 },
    { name: 'Personal Care', nameAr: 'رعاية شخصية', icon: '✨', color: '#F472B6', isDefault: true, isEssential: false, displayOrder: 14 },
    { name: 'Other Variable', nameAr: 'أخرى (متغيرة)', icon: '📝', color: '#9CA3AF', isDefault: true, isEssential: false, displayOrder: 15 },
  ];

  const categories = [...fixedCategories, ...variableCategories];

  for (const category of categories) {
    await prisma.expenseCategory.upsert({
      where: { 
        name: category.name 
      },
      update: {
        nameAr: category.nameAr,
        icon: category.icon,
        color: category.color,
        isDefault: category.isDefault,
        isEssential: category.isEssential,
        displayOrder: category.displayOrder,
      },
      create: category,
    });
  }

  console.log(`✅ Created ${categories.length} expense categories`);

  // =============================================
  // 2. Create Demo User (for development/testing)
  // =============================================
  if (process.env.NODE_ENV === 'development') {
    console.log('👤 Creating demo user...');

    const demoPassword = await bcrypt.hash('Demo@123', 12);
    
    const demoUser = await prisma.user.upsert({
      where: { phoneNumber: '+962791234567' },
      update: {},
      create: {
        phoneNumber: '+962791234567',
        fullName: 'أحمد محمد علي',
        birthDate: new Date('1998-05-15'),
        passwordHash: demoPassword,
        status: 'VERIFIED',
        isOnboarded: true,
        phoneVerifiedAt: new Date(),
      },
    });

    console.log(`✅ Created demo user: ${demoUser.phoneNumber}`);

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: demoUser.id,
        monthlyIncome: 1500.00,
        basicExpenses: 800.00,
        financialGoal: 'بناء صندوق طوارئ وشراء منزل',
        primarySpendingCategory: 'Food',
        occupation: 'Software Engineer',
        educationLevel: 'Bachelor',
        familySize: 1,
        hasEmergencyFund: false,
        riskTolerance: 'MEDIUM',
        version: 1,
        isCurrent: true,
        createdBy: demoUser.id,
      },
    });

    console.log('✅ Created user profile');

    // Create user settings
    await prisma.userSettings.create({
      data: {
        userId: demoUser.id,
        notificationsEnabled: true,
        pushNotifications: true,
        language: 'ar',
        currency: 'JOD',
        timezone: 'Asia/Amman',
        theme: 'light',
      },
    });

    console.log('✅ Created user settings');

    // Create sample financial goals
    const goals = [
      {
        userId: demoUser.id,
        icon: '🏠',
        name: 'شراء منزل',
        description: 'هدف شراء منزل خاص خلال 3 سنوات',
        targetAmount: 50000.00,
        currentAmount: 5000.00,
        targetDate: new Date('2027-12-31'),
        status: 'ACTIVE' as const,
        priority: 'HIGH' as const,
        category: 'real_estate',
        tags: ['housing', 'investment', 'long-term'],
      },
      {
        userId: demoUser.id,
        icon: '🚗',
        name: 'شراء سيارة',
        description: 'شراء سيارة جديدة',
        targetAmount: 15000.00,
        currentAmount: 2500.00,
        targetDate: new Date('2025-06-30'),
        status: 'ACTIVE' as const,
        priority: 'MEDIUM' as const,
        category: 'transportation',
        tags: ['car', 'transportation'],
      },
      {
        userId: demoUser.id,
        icon: '✈️',
        name: 'رحلة سياحية',
        description: 'رحلة سياحية إلى أوروبا',
        targetAmount: 5000.00,
        currentAmount: 1200.00,
        targetDate: new Date('2025-08-15'),
        status: 'ACTIVE' as const,
        priority: 'LOW' as const,
        category: 'travel',
        tags: ['travel', 'vacation', 'europe'],
      },
    ];

    for (const goal of goals) {
      await prisma.financialGoal.create({ data: goal });
    }

    console.log(`✅ Created ${goals.length} financial goals`);

    // Create sample expenses
    const foodCategory = await prisma.expenseCategory.findFirst({
      where: { name: 'Food' },
    });

    const transportCategory = await prisma.expenseCategory.findFirst({
      where: { name: 'Transportation' },
    });

    if (foodCategory && transportCategory) {
      const expenses = [
        {
          userId: demoUser.id,
          categoryId: foodCategory.id,
          amount: 25.50,
          description: 'غداء في المطعم',
          paymentMethod: 'CASH' as const,
          location: 'عمان، الأردن',
          merchantName: 'مطعم الأصالة',
          expenseDate: new Date('2024-01-15'),
          tags: ['lunch', 'restaurant'],
        },
        {
          userId: demoUser.id,
          categoryId: transportCategory.id,
          amount: 15.00,
          description: 'تاكسي إلى العمل',
          paymentMethod: 'CASH' as const,
          expenseDate: new Date('2024-01-15'),
          tags: ['commute', 'work'],
        },
        {
          userId: demoUser.id,
          categoryId: foodCategory.id,
          amount: 45.00,
          description: 'تسوق أسبوعي',
          paymentMethod: 'CARD' as const,
          merchantName: 'سوبر ماركت',
          expenseDate: new Date('2024-01-14'),
          tags: ['groceries', 'weekly'],
        },
      ];

      for (const expense of expenses) {
        await prisma.expense.create({ data: expense });
      }

      console.log(`✅ Created ${expenses.length} sample expenses`);
    }

    // Create sample income
    await prisma.income.create({
      data: {
        userId: demoUser.id,
        amount: 1500.00,
        source: 'راتب شهري',
        description: 'الراتب الشهري من العمل',
        frequency: 'MONTHLY',
        incomeDate: new Date('2024-01-01'),
        isActive: true,
        isRecurring: true,
      },
    });

    console.log('✅ Created sample income');

    // Create sample AI insights
    const insights = [
      {
        userId: demoUser.id,
        insightType: 'SPENDING_PATTERN' as const,
        title: 'Spending Pattern Alert',
        titleAr: 'تنبيه نمط الإنفاق',
        description: 'Your spending on food has increased by 25% this month.',
        descriptionAr: 'زاد إنفاقك على الطعام بنسبة 25% هذا الشهر',
        priority: 'MEDIUM' as const,
        data: {
          category: 'Food',
          previousAmount: 400,
          currentAmount: 500,
          percentage: 25,
        },
      },
      {
        userId: demoUser.id,
        insightType: 'GOAL_RECOMMENDATION' as const,
        title: 'Goal Progress Update',
        titleAr: 'تحديث تقدم الهدف',
        description: 'You are on track to reach your car goal!',
        descriptionAr: 'أنت على الطريق الصحيح لتحقيق هدف السيارة!',
        priority: 'HIGH' as const,
        data: {
          goalName: 'شراء سيارة',
          progress: 16.67,
          onTrack: true,
        },
      },
    ];

    for (const insight of insights) {
      await prisma.aiInsight.create({ data: insight });
    }

    console.log(`✅ Created ${insights.length} AI insights`);

    // Create sample notifications
    const notifications = [
      {
        userId: demoUser.id,
        type: 'GOAL_MILESTONE' as const,
        title: 'Congratulations!',
        titleAr: 'تهانينا!',
        message: 'You have reached 10% of your house goal!',
        messageAr: 'لقد وصلت إلى 10% من هدف المنزل!',
        priority: 'HIGH' as const,
        channels: ['push', 'in_app'],
        isSent: true,
        sentAt: new Date(),
      },
      {
        userId: demoUser.id,
        type: 'WEEKLY_SUMMARY' as const,
        title: 'Weekly Summary',
        titleAr: 'ملخص أسبوعي',
        message: 'Your weekly financial summary is ready!',
        messageAr: 'ملخصك المالي الأسبوعي جاهز!',
        priority: 'MEDIUM' as const,
        channels: ['push'],
        isSent: true,
        sentAt: new Date(),
      },
    ];

    for (const notification of notifications) {
      await prisma.notification.create({ data: notification });
    }

    console.log(`✅ Created ${notifications.length} notifications`);

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: demoUser.id,
        action: 'CREATE',
        entityType: 'user',
        entityId: demoUser.id,
        newValues: {
          phoneNumber: demoUser.phoneNumber,
          fullName: demoUser.fullName,
          status: demoUser.status,
        },
        success: true,
      },
    });

    console.log('✅ Created audit log entry');
  }

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
