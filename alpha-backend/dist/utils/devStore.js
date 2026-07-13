"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevStore = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const normalizePhoneNumber = (phoneNumber) => {
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
const createDevStore = (options = {}) => {
    const filePath = options.filePath || path_1.default.join(process.cwd(), '.dev-store.json');
    const ensureFile = () => {
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, JSON.stringify({ users: [], otps: [], sessions: [], profiles: [], settings: [] }, null, 2));
        }
        const content = fs_1.default.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    };
    const save = (data) => {
        fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2));
    };
    return {
        async createUser(user) {
            const data = ensureFile();
            const record = {
                ...user,
                phoneNumber: normalizePhoneNumber(user.phoneNumber),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            data.users.push(record);
            save(data);
            return record;
        },
        async findUserByPhone(phoneNumber) {
            const data = ensureFile();
            const normalizedPhone = normalizePhoneNumber(phoneNumber);
            return data.users.find((user) => user.phoneNumber === normalizedPhone);
        },
        async findUserById(userId) {
            const data = ensureFile();
            return data.users.find((user) => user.id === userId);
        },
        async updateUser(phoneNumber, updates) {
            const data = ensureFile();
            const normalizedPhone = normalizePhoneNumber(phoneNumber);
            const index = data.users.findIndex((user) => user.phoneNumber === normalizedPhone);
            if (index === -1)
                return undefined;
            data.users[index] = { ...data.users[index], ...updates, updatedAt: new Date() };
            save(data);
            return data.users[index];
        },
        async updateUserById(userId, updates) {
            const data = ensureFile();
            const index = data.users.findIndex((user) => user.id === userId);
            if (index === -1)
                return undefined;
            data.users[index] = { ...data.users[index], ...updates, updatedAt: new Date() };
            save(data);
            return data.users[index];
        },
        async createOtp(otp) {
            const data = ensureFile();
            const record = {
                ...otp,
                phoneNumber: normalizePhoneNumber(otp.phoneNumber),
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                createdAt: new Date(),
            };
            data.otps.push(record);
            save(data);
            return record;
        },
        async findLatestOtp(phoneNumber, purpose) {
            const data = ensureFile();
            const normalizedPhone = normalizePhoneNumber(phoneNumber);
            return data.otps
                .filter((otp) => otp.phoneNumber === normalizedPhone && otp.purpose === purpose && !otp.isUsed)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        },
        async markOtpUsed(id) {
            const data = ensureFile();
            const otp = data.otps.find((item) => item.id === id);
            if (!otp)
                return;
            otp.isUsed = true;
            otp.usedAt = new Date();
            save(data);
        },
        async incrementOtpAttempts(id) {
            const data = ensureFile();
            const otp = data.otps.find((item) => item.id === id);
            if (!otp)
                return;
            otp.attempts += 1;
            save(data);
        },
        async createProfile(profile) {
            const data = ensureFile();
            const record = {
                ...profile,
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                createdAt: new Date(),
            };
            data.profiles.push(record);
            save(data);
            return record;
        },
        async getCurrentProfile(userId) {
            const data = ensureFile();
            return data.profiles.find((profile) => profile.userId === userId && profile.isCurrent);
        },
        async listProfiles(userId) {
            const data = ensureFile();
            return data.profiles.filter((profile) => profile.userId === userId).sort((a, b) => b.version - a.version);
        },
        async getSettings(userId) {
            const data = ensureFile();
            return data.settings.find((setting) => setting.userId === userId);
        },
        async upsertSettings(userId, settings) {
            const data = ensureFile();
            const existing = data.settings.find((setting) => setting.userId === userId);
            if (existing) {
                const updated = { ...existing, ...settings, updatedAt: new Date() };
                data.settings = data.settings.map((setting) => setting.userId === userId ? updated : setting);
                save(data);
                return updated;
            }
            const record = {
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
        async createSession(session) {
            const data = ensureFile();
            const record = {
                ...session,
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            data.sessions.push(record);
            save(data);
            return record;
        },
        async findSessionByRefreshTokenHash(hash) {
            const data = ensureFile();
            return data.sessions.find((session) => session.refreshTokenHash === hash);
        },
        async listSessions(userId) {
            const data = ensureFile();
            return data.sessions.filter((session) => session.userId === userId && session.isActive);
        },
        async revokeSessions(userId, reason) {
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
        async updateSession(sessionId, updates) {
            const data = ensureFile();
            const index = data.sessions.findIndex((session) => session.id === sessionId);
            if (index === -1)
                return undefined;
            data.sessions[index] = { ...data.sessions[index], ...updates, updatedAt: new Date() };
            save(data);
            return data.sessions[index];
        },
    };
};
exports.createDevStore = createDevStore;
//# sourceMappingURL=devStore.js.map