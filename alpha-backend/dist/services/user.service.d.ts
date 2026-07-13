import { User, UserProfile, UserSettings } from '@prisma/client';
interface UpdateProfileParams {
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
    changeReason?: string;
}
interface UpdateUserParams {
    fullName?: string;
    birthDate?: string;
}
interface UpdatePasswordParams {
    userId: string;
    currentPassword: string;
    newPassword: string;
}
export declare class UserService {
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<User | null>;
    /**
     * Get user by phone number
     */
    getUserByPhone(phoneNumber: string): Promise<User | null>;
    /**
     * Get current user profile
     */
    getCurrentProfile(userId: string): Promise<UserProfile | null>;
    /**
     * Get profile history (all versions)
     */
    getProfileHistory(userId: string): Promise<UserProfile[]>;
    /**
     * Update user profile (creates new version)
     */
    updateProfile(params: UpdateProfileParams): Promise<UserProfile>;
    /**
     * Update basic user information
     */
    updateUser(userId: string, params: UpdateUserParams): Promise<User>;
    /**
     * Get user settings
     */
    getSettings(userId: string): Promise<UserSettings>;
    /**
     * Update user settings
     */
    updateSettings(userId: string, settingsData: Partial<UserSettings>): Promise<UserSettings>;
    /**
     * Create default settings for user
     */
    private createDefaultSettings;
    /**
     * Change user password
     */
    changePassword(params: UpdatePasswordParams): Promise<{
        message: string;
    }>;
    /**
     * Soft delete user account
     */
    deleteAccount(userId: string, password: string): Promise<{
        message: string;
    }>;
    /**
     * Get user statistics
     */
    getUserStats(userId: string): Promise<{
        totalGoals: number;
        activeGoals: number;
        completedGoals: number;
        totalExpenses: number;
        totalIncome: number;
        totalSaved: number;
        accountAge: number;
    }>;
    /**
     * Create audit log entry
     */
    private createAuditLog;
}
export declare const userService: UserService;
export {};
//# sourceMappingURL=user.service.d.ts.map