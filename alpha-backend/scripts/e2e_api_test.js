const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const baseUrl = 'http://127.0.0.1:3000/api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function req(method, path, body, token) {
  const url = `${baseUrl}${path}`;
  const headers = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  const options = { method, headers };
  if (body !== undefined) options.body = JSON.stringify(body);
  const resp = await fetch(url, options);
  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch (err) { data = text; }
  return { status: resp.status, data, ok: resp.ok };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function findOtp(phoneNumber, purpose) {
  const otp = await prisma.otpCode.findFirst({
    where: { phoneNumber, purpose, isUsed: false },
    orderBy: { createdAt: 'desc' },
  });
  return otp;
}

async function run() {
  const now = Date.now();
  const phoneNumber = `+9627${String(now).slice(-8)}`;
  const secondPhoneNumber = `+9627${String(now + 1000).slice(-8)}`;
  const password = 'StrongPass123!';
  const newPassword = 'NewStrongPass123!';
  const password2 = 'SecondPass123!';
  console.log('Starting E2E API verification against', baseUrl);
  console.log('Using phone number:', phoneNumber);

  const registerResp = await req('POST', '/auth/register', {
    phoneNumber,
    fullName: 'Test User',
    birthDate: '1995-01-01',
    password,
  });
  console.log('Register:', registerResp.status, JSON.stringify(registerResp.data));
  assert(registerResp.ok, 'Register failed');

  const normalizedPhone = phoneNumber.replace(/\D/g, '').startsWith('962') ? phoneNumber : `+962${phoneNumber.replace(/^0/, '')}`;
  await sleep(1000);
  const otpEntry = await findOtp(normalizedPhone, 'REGISTRATION');
  assert(otpEntry, 'OTP entry not found in DB after registration');
  console.log('Found registration OTP:', otpEntry.code);

  const resendOtpResp = await req('POST', '/auth/resend-otp', {
    phoneNumber,
    purpose: 'REGISTRATION',
  });
  console.log('Resend OTP:', resendOtpResp.status, JSON.stringify(resendOtpResp.data));
  assert(resendOtpResp.ok, 'Resend OTP failed');

  await sleep(1000);
  const otpEntry2 = await findOtp(normalizedPhone, 'REGISTRATION');
  assert(otpEntry2, 'Resent OTP entry not found in DB');
  assert(otpEntry2.id !== otpEntry.id, 'Resent OTP should differ from original OTP');
  console.log('Found resent registration OTP:', otpEntry2.code);

  const verifyResp = await req('POST', '/auth/verify-phone', {
    phoneNumber,
    otpCode: otpEntry2.code,
  });
  console.log('Verify phone:', verifyResp.status, JSON.stringify(verifyResp.data));
  assert(verifyResp.ok, 'Verify phone failed');
  let accessToken = verifyResp.data.data.tokens.accessToken;
  const refreshToken = verifyResp.data.data.tokens.refreshToken;
  const userId = verifyResp.data.data.user.id;
  assert(accessToken, 'Access token missing');
  assert(refreshToken, 'Refresh token missing');
  console.log('Authenticated userId:', userId);

  const meResp = await req('GET', '/auth/me', undefined, accessToken);
  console.log('Auth me:', meResp.status, JSON.stringify(meResp.data));
  assert(meResp.ok, 'Auth /me failed');

  const refreshResp = await req('POST', '/auth/refresh-token', { refreshToken });
  console.log('Refresh token:', refreshResp.status, JSON.stringify(refreshResp.data));
  assert(refreshResp.ok, 'Refresh token failed');
  const refreshedAccessToken = refreshResp.data.data.accessToken;
  const refreshedRefreshToken = refreshResp.data.data.refreshToken;
  assert(refreshedAccessToken, 'Refreshed access token missing');
  assert(refreshedRefreshToken, 'Refreshed refresh token missing');

  const requestPasswordResetResp = await req('POST', '/auth/request-password-reset', { phoneNumber });
  console.log('Request password reset:', requestPasswordResetResp.status, JSON.stringify(requestPasswordResetResp.data));
  assert(requestPasswordResetResp.ok, 'Request password reset failed');

  await sleep(1000);
  const resetOtp = await findOtp(normalizedPhone, 'PASSWORD_RESET');
  assert(resetOtp, 'Password reset OTP not found');
  console.log('Found password reset OTP:', resetOtp.code);

  const resetResp = await req('POST', '/auth/reset-password', {
    phoneNumber,
    otpCode: resetOtp.code,
    newPassword,
  });
  console.log('Reset password:', resetResp.status, JSON.stringify(resetResp.data));
  assert(resetResp.ok, 'Password reset failed');

  const oldLoginResp = await req('POST', '/auth/login', {
    phoneNumber,
    password,
  });
  console.log('Login with old password (should fail):', oldLoginResp.status, JSON.stringify(oldLoginResp.data));
  assert(!oldLoginResp.ok, 'Old password login should have failed');

  const loginResp = await req('POST', '/auth/login', {
    phoneNumber,
    password: newPassword,
  });
  console.log('Login with new password:', loginResp.status, JSON.stringify(loginResp.data));
  assert(loginResp.ok, 'Login with new password failed');

  let authToken = loginResp.data.data.tokens.accessToken;
  let authRefreshToken = loginResp.data.data.tokens.refreshToken;

  const categoriesResp = await req('GET', '/expenses/categories');
  console.log('Get expense categories:', categoriesResp.status, JSON.stringify(categoriesResp.data));
  assert(categoriesResp.ok, 'Get expense categories failed');

  const profileResp = await req('GET', '/users/profile', undefined, authToken);
  console.log('Get profile:', profileResp.status, JSON.stringify(profileResp.data));
  assert(profileResp.ok, 'Get profile failed');

  const statusResp = await req('GET', '/onboarding/status', undefined, authToken);
  console.log('Onboarding status:', statusResp.status, JSON.stringify(statusResp.data));
  assert(statusResp.ok, 'Get onboarding status failed');

  const financialInfoResp = await req('POST', '/onboarding/financial-info', {
    monthlyIncome: 1500,
    basicExpenses: 800,
    financialGoal: 'Save for emergency fund',
    primarySpendingCategory: 'Food',
  }, authToken);
  console.log('Complete financial info:', financialInfoResp.status, JSON.stringify(financialInfoResp.data));
  assert(financialInfoResp.ok, 'Complete financial info failed');

  const recommendedGoalsResp = await req('GET', '/onboarding/recommended-goals', undefined, authToken);
  console.log('Recommended goals:', recommendedGoalsResp.status, JSON.stringify(recommendedGoalsResp.data));
  assert(recommendedGoalsResp.ok, 'Get recommended goals failed');

  const firstGoalResp = await req('POST', '/onboarding/first-goal', {
    icon: 'ðŸ¦',
    name: 'Emergency Fund',
    targetAmount: 1000,
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }, authToken);
  console.log('Create first goal:', firstGoalResp.status, JSON.stringify(firstGoalResp.data));
  assert(firstGoalResp.ok, 'Create first goal failed');
  const goalId = firstGoalResp.data.data.goal.id;

  const postOnboardingRefreshResp = await req('POST', '/auth/refresh-token', { refreshToken: authRefreshToken });
  console.log('Post-onboarding refresh token:', postOnboardingRefreshResp.status, JSON.stringify(postOnboardingRefreshResp.data));
  assert(postOnboardingRefreshResp.ok, 'Post-onboarding refresh token failed');
  const updatedAccessToken = postOnboardingRefreshResp.data.data.accessToken;
  const updatedRefreshToken = postOnboardingRefreshResp.data.data.refreshToken;
  assert(updatedAccessToken, 'Updated access token missing');
  assert(updatedRefreshToken, 'Updated refresh token missing');
  authToken = updatedAccessToken;
  authRefreshToken = updatedRefreshToken;

  const goalsResp = await req('GET', '/goals', undefined, authToken);
  console.log('Get goals:', goalsResp.status, JSON.stringify(goalsResp.data));
  assert(goalsResp.ok, 'Get goals failed');
  assert(Array.isArray(goalsResp.data.data) && goalsResp.data.data.length >= 1, 'No goals found');

  const goalByIdResp = await req('GET', `/goals/${goalId}`, undefined, authToken);
  console.log('Get goal by ID:', goalByIdResp.status, JSON.stringify(goalByIdResp.data));
  assert(goalByIdResp.ok, 'Get goal by ID failed');

  const updateGoalResp = await req('PATCH', `/goals/${goalId}`, {
    name: 'Emergency Fund Updated',
    targetAmount: 1200,
  }, authToken);
  console.log('Update goal:', updateGoalResp.status, JSON.stringify(updateGoalResp.data));
  assert(updateGoalResp.ok, 'Update goal failed');

  const createCategoryResp = await req('POST', '/expenses/categories', {
    name: 'Test Category',
    icon: 'ðŸ·ï¸',
    color: '#123456',
  }, authToken);
  console.log('Create expense category:', createCategoryResp.status, JSON.stringify(createCategoryResp.data));
  assert(createCategoryResp.ok, 'Create expense category failed');
  const categoryId = createCategoryResp.data.data.id;

  const createExpenseResp = await req('POST', '/expenses', {
    categoryId,
    amount: 45.5,
    description: 'Test lunch expense',
    paymentMethod: 'CARD',
    location: 'Amman',
    tags: ['food', 'work'],
    notes: 'Lunch with team',
  }, authToken);
  console.log('Create expense:', createExpenseResp.status, JSON.stringify(createExpenseResp.data));
  assert(createExpenseResp.ok, 'Create expense failed');
  const expenseId = createExpenseResp.data.data.id;

  const expensesResp = await req('GET', '/expenses', undefined, authToken);
  console.log('Get expenses:', expensesResp.status, JSON.stringify(expensesResp.data));
  assert(expensesResp.ok, 'Get expenses failed');
  assert(Array.isArray(expensesResp.data.data) && expensesResp.data.data.length >= 1, 'Expected at least one expense');

  const expenseByIdResp = await req('GET', `/expenses/${expenseId}`, undefined, authToken);
  console.log('Get expense by id:', expenseByIdResp.status, JSON.stringify(expenseByIdResp.data));
  assert(expenseByIdResp.ok, 'Get expense by id failed');

  const updateExpenseResp = await req('PATCH', `/expenses/${expenseId}`, {
    amount: 50.75,
    notes: 'Updated notes',
  }, authToken);
  console.log('Update expense:', updateExpenseResp.status, JSON.stringify(updateExpenseResp.data));
  assert(updateExpenseResp.ok, 'Update expense failed');

  const deleteExpenseResp = await req('DELETE', `/expenses/${expenseId}`, undefined, authToken);
  console.log('Delete expense:', deleteExpenseResp.status, JSON.stringify(deleteExpenseResp.data));
  assert(deleteExpenseResp.ok, 'Delete expense failed');

  const expensesAfterDeleteResp = await req('GET', '/expenses', undefined, authToken);
  console.log('Get expenses after delete:', expensesAfterDeleteResp.status, JSON.stringify(expensesAfterDeleteResp.data));
  assert(expensesAfterDeleteResp.ok, 'Get expenses after delete failed');
  assert(!Array.isArray(expensesAfterDeleteResp.data.data) || !expensesAfterDeleteResp.data.data.some((e) => e.id === expenseId), 'Deleted expense still present');

  const expenseStatsResp = await req('GET', '/expenses/stats', undefined, authToken);
  console.log('Expense stats:', expenseStatsResp.status, JSON.stringify(expenseStatsResp.data));
  assert(expenseStatsResp.ok, 'Expense stats failed');

  const monthlyComparisonResp = await req('GET', '/expenses/monthly-comparison', undefined, authToken);
  console.log('Monthly comparison:', monthlyComparisonResp.status, JSON.stringify(monthlyComparisonResp.data));
  assert(monthlyComparisonResp.ok, 'Monthly comparison failed');

  const createIncomeResp = await req('POST', '/incomes', {
    amount: 1200.5,
    source: 'Salary',
    description: 'Monthly salary',
    incomeDate: new Date().toISOString().split('T')[0],
  }, authToken);
  console.log('Create income:', createIncomeResp.status, JSON.stringify(createIncomeResp.data));
  assert(createIncomeResp.ok, 'Create income failed');
  const incomeId = createIncomeResp.data.data.id;

  const incomesResp = await req('GET', '/incomes', undefined, authToken);
  console.log('Get incomes:', incomesResp.status, JSON.stringify(incomesResp.data));
  assert(incomesResp.ok, 'Get incomes failed');
  assert(Array.isArray(incomesResp.data.data) && incomesResp.data.data.some((income) => income.id === incomeId), 'Created income not found in list');

  const incomeByIdResp = await req('GET', `/incomes/${incomeId}`, undefined, authToken);
  console.log('Get income by id:', incomeByIdResp.status, JSON.stringify(incomeByIdResp.data));
  assert(incomeByIdResp.ok, 'Get income by id failed');

  const updateIncomeResp = await req('PATCH', `/incomes/${incomeId}`, { amount: 1300.25 }, authToken);
  console.log('Update income:', updateIncomeResp.status, JSON.stringify(updateIncomeResp.data));
  assert(updateIncomeResp.ok, 'Update income failed');

  const incomeStatsResp = await req('GET', '/incomes/stats', undefined, authToken);
  console.log('Income stats:', incomeStatsResp.status, JSON.stringify(incomeStatsResp.data));
  assert(incomeStatsResp.ok, 'Income stats failed');

  const deleteIncomeResp = await req('DELETE', `/incomes/${incomeId}`, undefined, authToken);
  console.log('Delete income:', deleteIncomeResp.status, JSON.stringify(deleteIncomeResp.data));
  assert(deleteIncomeResp.ok, 'Delete income failed');

  const addTransactionResp = await req('POST', `/goals/${goalId}/transactions`, {
    amount: 300,
    transactionType: 'DEPOSIT',
    description: 'Initial deposit',
  }, authToken);
  console.log('Add goal transaction:', addTransactionResp.status, JSON.stringify(addTransactionResp.data));
  assert(addTransactionResp.ok, 'Add goal transaction failed');

  const goalTransactionsResp = await req('GET', `/goals/${goalId}/transactions`, undefined, authToken);
  console.log('Get goal transactions:', goalTransactionsResp.status, JSON.stringify(goalTransactionsResp.data));
  assert(goalTransactionsResp.ok, 'Get goal transactions failed');

  const goalStatsResp = await req('GET', `/goals/${goalId}/stats`, undefined, authToken);
  console.log('Goal stats:', goalStatsResp.status, JSON.stringify(goalStatsResp.data));
  assert(goalStatsResp.ok, 'Get goal stats failed');

  const deleteGoalResp = await req('DELETE', `/goals/${goalId}`, undefined, authToken);
  console.log('Delete goal:', deleteGoalResp.status, JSON.stringify(deleteGoalResp.data));
  assert(deleteGoalResp.ok, 'Delete goal failed');

  const goalsAfterDeleteResp = await req('GET', '/goals', undefined, authToken);
  console.log('Get goals after delete:', goalsAfterDeleteResp.status, JSON.stringify(goalsAfterDeleteResp.data));
  assert(goalsAfterDeleteResp.ok, 'Get goals after delete failed');
  assert(!Array.isArray(goalsAfterDeleteResp.data.data) || !goalsAfterDeleteResp.data.data.some((goal) => goal.id === goalId), 'Deleted goal still present');

  const notificationsResp = await req('GET', '/notifications', undefined, authToken);
  console.log('Get notifications:', notificationsResp.status, JSON.stringify(notificationsResp.data));
  assert(notificationsResp.ok, 'Get notifications failed');
  const notifications = notificationsResp.data.data || [];

  const unreadCountResp = await req('GET', '/notifications/unread-count', undefined, authToken);
  console.log('Unread count:', unreadCountResp.status, JSON.stringify(unreadCountResp.data));
  assert(unreadCountResp.ok, 'Unread count failed');

  if (notifications.length > 0) {
    const firstNotificationId = notifications[0].id;
    const getNotificationResp = await req('GET', `/notifications/${firstNotificationId}`, undefined, authToken);
    console.log('Get notification by id:', getNotificationResp.status, JSON.stringify(getNotificationResp.data));
    assert(getNotificationResp.ok, 'Get notification by id failed');

    const markAsReadResp = await req('PATCH', `/notifications/${firstNotificationId}/read`, undefined, authToken);
    console.log('Mark notification as read:', markAsReadResp.status, JSON.stringify(markAsReadResp.data));
    assert(markAsReadResp.ok, 'Mark notification as read failed');
  }

  const markAllAsReadResp = await req('POST', '/notifications/read-all', undefined, authToken);
  console.log('Mark all notifications as read:', markAllAsReadResp.status, JSON.stringify(markAllAsReadResp.data));
  assert(markAllAsReadResp.ok, 'Mark all notifications as read failed');

  const deleteAllReadResp = await req('DELETE', '/notifications/read', undefined, authToken);
  console.log('Delete all read notifications:', deleteAllReadResp.status, JSON.stringify(deleteAllReadResp.data));
  assert(deleteAllReadResp.ok, 'Delete all read notifications failed');

  const notificationsAfterDeleteResp = await req('GET', '/notifications', undefined, authToken);
  const remainingNotifications = notificationsAfterDeleteResp.data.data || [];
  if (remainingNotifications.length > 0) {
    const notificationId = remainingNotifications[0].id;
    const deleteNotificationResp = await req('DELETE', `/notifications/${notificationId}`, undefined, authToken);
    console.log('Delete notification by id:', deleteNotificationResp.status, JSON.stringify(deleteNotificationResp.data));
    assert(deleteNotificationResp.ok, 'Delete notification by id failed');
  }

  const getCurrentProfileResp = await req('GET', '/users/profile/current', undefined, authToken);
  console.log('Get current profile:', getCurrentProfileResp.status, JSON.stringify(getCurrentProfileResp.data));
  assert(getCurrentProfileResp.ok, 'Get current profile failed');

  const profileHistoryResp = await req('GET', '/users/profile/history', undefined, authToken);
  console.log('Get profile history:', profileHistoryResp.status, JSON.stringify(profileHistoryResp.data));
  assert(profileHistoryResp.ok, 'Get profile history failed');

  const updateUserResp = await req('PATCH', '/users/profile', {
    fullName: 'Updated Test User',
  }, authToken);
  console.log('Update user:', updateUserResp.status, JSON.stringify(updateUserResp.data));
  assert(updateUserResp.ok, 'Update user failed');

  const updateProfileResp = await req('PUT', '/users/profile/update', {
    monthlyIncome: 1600,
    basicExpenses: 700,
    financialGoal: 'Save for vacation',
    primarySpendingCategory: 'Travel',
    occupation: 'Engineer',
    educationLevel: 'Bachelor',
    familySize: 3,
    hasEmergencyFund: true,
    riskTolerance: 'MEDIUM',
    changeReason: 'Adjusting budget',
  }, authToken);
  console.log('Update profile:', updateProfileResp.status, JSON.stringify(updateProfileResp.data));
  assert(updateProfileResp.ok, 'Update profile failed');

  const getSettingsResp = await req('GET', '/users/settings', undefined, authToken);
  console.log('Get settings:', getSettingsResp.status, JSON.stringify(getSettingsResp.data));
  assert(getSettingsResp.ok, 'Get settings failed');

  const updateSettingsResp = await req('PATCH', '/users/settings', {
    language: 'en',
    currency: 'USD',
    budgetAlertThreshold: 75,
  }, authToken);
  console.log('Update settings:', updateSettingsResp.status, JSON.stringify(updateSettingsResp.data));
  assert(updateSettingsResp.ok, 'Update settings failed');

  const changePasswordResp = await req('POST', '/users/change-password', {
    currentPassword: newPassword,
    newPassword: 'FinalPass123!'
  }, authToken);
  console.log('Change password:', changePasswordResp.status, JSON.stringify(changePasswordResp.data));
  assert(changePasswordResp.ok, 'Change password failed');

  const statsResp = await req('GET', '/users/stats', undefined, authToken);
  console.log('Get user stats:', statsResp.status, JSON.stringify(statsResp.data));
  assert(statsResp.ok, 'Get user stats failed');

  const dashboardResp = await req('GET', '/dashboard', undefined, authToken);
  console.log('Get dashboard summary:', dashboardResp.status, JSON.stringify(dashboardResp.data));
  assert(dashboardResp.ok, 'Get dashboard summary failed');

  const healthScoreResp = await req('GET', '/dashboard/health-score', undefined, authToken);
  console.log('Get financial health score:', healthScoreResp.status, JSON.stringify(healthScoreResp.data));
  assert(healthScoreResp.ok, 'Get financial health score failed');

  const register2Resp = await req('POST', '/auth/register', {
    phoneNumber: secondPhoneNumber,
    fullName: 'Delete Test User',
    birthDate: '1996-02-02',
    password: password2,
  });
  console.log('Register second user:', register2Resp.status, JSON.stringify(register2Resp.data));
  assert(register2Resp.ok, 'Register second user failed');

  await sleep(1000);
  const secondOtpEntry = await findOtp(secondPhoneNumber, 'REGISTRATION');
  assert(secondOtpEntry, 'OTP entry not found in DB for second user');
  console.log('Found second user registration OTP:', secondOtpEntry.code);

  const verifySecondResp = await req('POST', '/auth/verify-phone', {
    phoneNumber: secondPhoneNumber,
    otpCode: secondOtpEntry.code,
  });
  console.log('Verify second user phone:', verifySecondResp.status, JSON.stringify(verifySecondResp.data));
  assert(verifySecondResp.ok, 'Verify second user phone failed');

  const login2Resp = await req('POST', '/auth/login', {
    phoneNumber: secondPhoneNumber,
    password: password2,
  });
  console.log('Login second user:', login2Resp.status, JSON.stringify(login2Resp.data));
  assert(login2Resp.ok, 'Login second user failed');
  const secondAuthToken = login2Resp.data.data.tokens.accessToken;

  const skipOnboardingResp = await req('POST', '/onboarding/skip', undefined, secondAuthToken);
  console.log('Skip onboarding for second user:', skipOnboardingResp.status, JSON.stringify(skipOnboardingResp.data));
  assert(skipOnboardingResp.ok, 'Skip onboarding failed for second user');

  const deleteAccountResp = await req('DELETE', '/users/account', {
    password: password2,
  }, secondAuthToken);
  console.log('Delete second user account:', deleteAccountResp.status, JSON.stringify(deleteAccountResp.data));
  assert(deleteAccountResp.ok, 'Delete account failed for second user');

  const deletedUser = await prisma.user.findUnique({
    where: { phoneNumber: secondPhoneNumber },
  });
  assert(deletedUser && deletedUser.deletedAt, 'Deleted user not soft deleted');
  assert(deletedUser.status === 'DELETED', 'Deleted user status is not DELETED');

  const logoutResp = await req('POST', '/auth/logout', { refreshToken: authRefreshToken }, authToken);
  console.log('Logout:', logoutResp.status, JSON.stringify(logoutResp.data));
  assert(logoutResp.ok, 'Logout failed');

  const refreshAfterLogoutResp = await req('POST', '/auth/refresh-token', { refreshToken: authRefreshToken });
  console.log('Refresh after logout (should fail):', refreshAfterLogoutResp.status, JSON.stringify(refreshAfterLogoutResp.data));
  assert(!refreshAfterLogoutResp.ok, 'Refresh token should fail after logout');

  const auditLogs = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  console.log('Audit log entries count:', auditLogs.length);
  assert(auditLogs.length >= 1, 'Expected audit log entries to be created');

  console.log('E2E API verification completed successfully');
  await prisma.$disconnect();
}

run().catch(async (error) => {
  console.error('E2E API verification failed:', error.message || error);
  console.error(error.stack);
  await prisma.$disconnect();
  process.exit(1);
});


