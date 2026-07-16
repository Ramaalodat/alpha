import fs from 'fs';
import path from 'path';

const normalizePhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('962')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+962${cleaned.slice(1)}`;
  }
  if (cleaned.length === 9 && cleaned.startsWith('7')) {
    return `+962${cleaned}`;
  }
  return `+962${cleaned}`;
};

interface DevStoreOptions {
  filePath?: string;
}

interface DevUserRecord {
  id: string;
  phoneNumber: string;
  fullName: string;
  birthDate: Date;
  passwordHash: string;
  status: string;
  isOnboarded: boolean;
  email?: string;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  phoneVerifiedAt?: Date;
}

interface DevOtpRecord {
  id: string;
  phoneNumber: string;
  code: string;
  purpose: string;
  isUsed: boolean;
  attempts: number;
  usedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

interface DevSessionRecord {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  isActive: boolean;
  isRevoked: boolean;
  revokedAt?: Date;
  revokeReason?: string;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface DevProfileRecord {
  id: string;
  userId: string;
  monthlyIncome?: number;
  basicExpenses?: number;
  financialGoal?: string;
  primarySpendingCategory?: string;
  occupation?: string;
  educationLevel?: string;
  familySize?: number;
  hasEmergencyFund?: boolean;
  riskTolerance?: string;
  version: number;
  isCurrent: boolean;
  changeReason?: string;
  createdAt: Date;
  createdBy?: string;
}

interface DevSettingsRecord {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklySummary: boolean;
  monthlySummary: boolean;
  spendingAlerts: boolean;
  goalReminders: boolean;
  language: string;
  currency: string;
  timezone: string;
  theme: string;
  dataSharing: boolean;
  analyticsOptIn: boolean;
  marketingOptIn: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  defaultBudgetPeriod: string;
  budgetAlertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DevGoalRecord {
  id: string;
  userId: string;
  icon: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: string;
  priority: string;
  progressPercentage: number;
  flexibility?: string;
  deletedAt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DevExpenseRecord {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description?: string;
  expenseDate: string;
  expenseType?: string;
  isRecurring: boolean;
  pinnedMonths?: number;
  pinnedUntil?: string;
  deletedAt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DevIncomeRecord {
  id: string;
  userId: string;
  amount: number;
  source: string;
  description?: string;
  frequency: string;
  sourceType?: string;
  incomeDate: string;
  isRecurring: boolean;
  pinnedMonths?: number;
  pinnedUntil?: string;
  deletedAt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DevCategoryRecord {
  id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  color: string;
  isDefault: boolean;
  isEssential: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DevStoreData {
  users: DevUserRecord[];
  otps: DevOtpRecord[];
  sessions: DevSessionRecord[];
  profiles: DevProfileRecord[];
  settings: DevSettingsRecord[];
  goals: DevGoalRecord[];
  expenses: DevExpenseRecord[];
  incomes: DevIncomeRecord[];
  categories: DevCategoryRecord[];
}

export const createDevStore = (options: DevStoreOptions = {}) => {
  const filePath = options.filePath || path.join(process.cwd(), '.dev-store.json');

  const ensureFile = (): DevStoreData => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({ users: [], otps: [], sessions: [], profiles: [], settings: [], goals: [], expenses: [], incomes: [], categories: [] }, null, 2));
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content) as DevStoreData;
    // Ensure new arrays exist for backwards compatibility
    if (!data.goals) data.goals = [];
    if (!data.expenses) data.expenses = [];
    if (!data.incomes) data.incomes = [];
    if (!data.categories) data.categories = [];
    return data;
  };

  const save = (data: DevStoreData) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  };

  return {
    async createUser(user: Omit<DevUserRecord, 'createdAt' | 'updatedAt'>): Promise<DevUserRecord> {
      const data = ensureFile();
      const record: DevUserRecord = {
        ...user,
        phoneNumber: normalizePhoneNumber(user.phoneNumber),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      data.users.push(record);
      save(data);
      return record;
    },

    async findUserByPhone(phoneNumber: string): Promise<DevUserRecord | undefined> {
      const data = ensureFile();
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      return data.users.find((user) => user.phoneNumber === normalizedPhone);
    },

    async findUserById(userId: string): Promise<DevUserRecord | undefined> {
      const data = ensureFile();
      return data.users.find((user) => user.id === userId);
    },

    async updateUser(phoneNumber: string, updates: Partial<DevUserRecord>): Promise<DevUserRecord | undefined> {
      const data = ensureFile();
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const index = data.users.findIndex((user) => user.phoneNumber === normalizedPhone);
      if (index === -1) return undefined;
      data.users[index] = { ...data.users[index], ...updates, updatedAt: new Date() };
      save(data);
      return data.users[index];
    },

    async updateUserById(userId: string, updates: Partial<DevUserRecord>): Promise<DevUserRecord | undefined> {
      const data = ensureFile();
      const index = data.users.findIndex((user) => user.id === userId);
      if (index === -1) return undefined;
      data.users[index] = { ...data.users[index], ...updates, updatedAt: new Date() };
      save(data);
      return data.users[index];
    },

    async createOtp(otp: Omit<DevOtpRecord, 'id' | 'createdAt'>): Promise<DevOtpRecord> {
      const data = ensureFile();
      const record: DevOtpRecord = {
        ...otp,
        phoneNumber: normalizePhoneNumber(otp.phoneNumber),
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date(),
      };
      data.otps.push(record);
      save(data);
      return record;
    },

    async findLatestOtp(phoneNumber: string, purpose: string): Promise<DevOtpRecord | undefined> {
      const data = ensureFile();
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      return data.otps
        .filter((otp) => otp.phoneNumber === normalizedPhone && otp.purpose === purpose && !otp.isUsed)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    },

    async markOtpUsed(id: string): Promise<void> {
      const data = ensureFile();
      const otp = data.otps.find((item) => item.id === id);
      if (!otp) return;
      otp.isUsed = true;
      otp.usedAt = new Date();
      save(data);
    },

    async incrementOtpAttempts(id: string): Promise<void> {
      const data = ensureFile();
      const otp = data.otps.find((item) => item.id === id);
      if (!otp) return;
      otp.attempts += 1;
      save(data);
    },

    async createProfile(profile: Omit<DevProfileRecord, 'id' | 'createdAt'>): Promise<DevProfileRecord> {
      const data = ensureFile();
      const record: DevProfileRecord = {
        ...profile,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date(),
      };
      data.profiles.push(record);
      save(data);
      return record;
    },

    async getCurrentProfile(userId: string): Promise<DevProfileRecord | undefined> {
      const data = ensureFile();
      return data.profiles.find((profile) => profile.userId === userId && profile.isCurrent);
    },

    async listProfiles(userId: string): Promise<DevProfileRecord[]> {
      const data = ensureFile();
      return data.profiles.filter((profile) => profile.userId === userId).sort((a, b) => b.version - a.version);
    },

    async getSettings(userId: string): Promise<DevSettingsRecord | undefined> {
      const data = ensureFile();
      return data.settings.find((setting) => setting.userId === userId);
    },

    async upsertSettings(userId: string, settings: Partial<DevSettingsRecord>): Promise<DevSettingsRecord> {
      const data = ensureFile();
      const existing = data.settings.find((setting) => setting.userId === userId);
      if (existing) {
        const updated = { ...existing, ...settings, updatedAt: new Date() };
        data.settings = data.settings.map((setting) => setting.userId === userId ? updated : setting);
        save(data);
        return updated;
      }

      const record: DevSettingsRecord = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        userId,
        notificationsEnabled: true,
        emailNotifications: false,
        pushNotifications: true,
        smsNotifications: true,
        weeklySummary: true,
        monthlySummary: true,
        spendingAlerts: true,
        goalReminders: true,
        language: 'ar',
        currency: 'JOD',
        timezone: 'Asia/Amman',
        theme: 'light',
        dataSharing: false,
        analyticsOptIn: true,
        marketingOptIn: false,
        twoFactorEnabled: false,
        sessionTimeout: 30,
        defaultBudgetPeriod: 'MONTHLY',
        budgetAlertThreshold: 80,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...settings,
      };
      data.settings.push(record);
      save(data);
      return record;
    },

    async createSession(session: Omit<DevSessionRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DevSessionRecord> {
      const data = ensureFile();
      const record: DevSessionRecord = {
        ...session,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      data.sessions.push(record);
      save(data);
      return record;
    },

    async findSessionByRefreshTokenHash(hash: string): Promise<DevSessionRecord | undefined> {
      const data = ensureFile();
      return data.sessions.find((session) => session.refreshTokenHash === hash);
    },

    async listSessions(userId: string): Promise<DevSessionRecord[]> {
      const data = ensureFile();
      return data.sessions.filter((session) => session.userId === userId && session.isActive);
    },

    async revokeSessions(userId: string, reason: string): Promise<void> {
      const data = ensureFile();
      data.sessions.forEach((session) => {
        if (session.userId === userId && session.isActive) {
          session.isActive = false;
          session.isRevoked = true;
          session.revokedAt = new Date();
          session.revokeReason = reason;
          session.updatedAt = new Date();
        }
      });
      save(data);
    },

    async updateProfile(profileId: string, updates: Partial<DevProfileRecord>): Promise<DevProfileRecord | undefined> {
      const data = ensureFile();
      const index = data.profiles.findIndex((p) => p.id === profileId);
      if (index === -1) return undefined;
      data.profiles[index] = { ...data.profiles[index], ...updates };
      save(data);
      return data.profiles[index];
    },

    async deleteProfilesByUserAndCriteria(
      userId: string,
      predicate: (p: DevProfileRecord) => boolean,
    ): Promise<void> {
      const data = ensureFile();
      data.profiles = data.profiles.filter(
        (p) => p.userId !== userId || !predicate(p),
      );
      save(data);
    },

    // ── Goals ──────────────────────────────────────────────
    async createGoal(goal: Omit<DevGoalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DevGoalRecord> {
      const data = ensureFile();
      const record: DevGoalRecord = { ...goal, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date(), updatedAt: new Date() };
      data.goals.push(record);
      save(data);
      return record;
    },

    async findGoal(userId: string, predicate: (g: DevGoalRecord) => boolean): Promise<DevGoalRecord | undefined> {
      const data = ensureFile();
      return data.goals.find((g) => g.userId === userId && predicate(g));
    },

    async updateGoal(goalId: string, updates: Partial<DevGoalRecord>): Promise<DevGoalRecord | undefined> {
      const data = ensureFile();
      const index = data.goals.findIndex((g) => g.id === goalId);
      if (index === -1) return undefined;
      data.goals[index] = { ...data.goals[index], ...updates, updatedAt: new Date() };
      save(data);
      return data.goals[index];
    },

    async listGoals(userId: string, includeDeleted = false): Promise<DevGoalRecord[]> {
      const data = ensureFile();
      return data.goals.filter((g) => g.userId === userId && (includeDeleted || !g.deletedAt));
    },

    // ── Expenses ───────────────────────────────────────────
    async createExpense(expense: Omit<DevExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DevExpenseRecord> {
      const data = ensureFile();
      const record: DevExpenseRecord = { ...expense, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date(), updatedAt: new Date() };
      data.expenses.push(record);
      save(data);
      return record;
    },

    async deleteExpenses(userId: string, predicate: (e: DevExpenseRecord) => boolean): Promise<void> {
      const data = ensureFile();
      data.expenses = data.expenses.filter((e) => e.userId !== userId || !predicate(e));
      save(data);
    },

    async listExpenses(userId: string, includeDeleted = false): Promise<DevExpenseRecord[]> {
      const data = ensureFile();
      return data.expenses.filter((e) => e.userId === userId && (includeDeleted || !e.deletedAt));
    },

    // ── Income ─────────────────────────────────────────────
    async createIncome(income: Omit<DevIncomeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DevIncomeRecord> {
      const data = ensureFile();
      const record: DevIncomeRecord = { ...income, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date(), updatedAt: new Date() };
      data.incomes.push(record);
      save(data);
      return record;
    },

    async deleteIncomes(userId: string, predicate: (i: DevIncomeRecord) => boolean): Promise<void> {
      const data = ensureFile();
      data.incomes = data.incomes.filter((i) => i.userId !== userId || !predicate(i));
      save(data);
    },

    async listIncomes(userId: string, includeDeleted = false): Promise<DevIncomeRecord[]> {
      const data = ensureFile();
      return data.incomes.filter((i) => i.userId === userId && (includeDeleted || !i.deletedAt));
    },

    // ── Categories ─────────────────────────────────────────
    async findCategory(predicate: (c: DevCategoryRecord) => boolean): Promise<DevCategoryRecord | undefined> {
      const data = ensureFile();
      return data.categories.find(predicate);
    },

    async upsertCategory(cat: Omit<DevCategoryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DevCategoryRecord> {
      const data = ensureFile();
      const existing = data.categories.find((c) => c.name === cat.name);
      if (existing) {
        Object.assign(existing, cat, { updatedAt: new Date() });
        save(data);
        return existing;
      }
      const record: DevCategoryRecord = { ...cat, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date(), updatedAt: new Date() };
      data.categories.push(record);
      save(data);
      return record;
    },

    async updateSession(sessionId: string, updates: Partial<DevSessionRecord>): Promise<DevSessionRecord | undefined> {
      const data = ensureFile();
      const index = data.sessions.findIndex((session) => session.id === sessionId);
      if (index === -1) return undefined;
      data.sessions[index] = { ...data.sessions[index], ...updates, updatedAt: new Date() };
      save(data);
      return data.sessions[index];
    },
  };
};
