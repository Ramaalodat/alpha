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
  const password = 'IncomePass123!';

  console.log('Starting Income E2E test against', baseUrl);
  console.log('Registering user', phoneNumber);

  const registerResp = await req('POST', '/auth/register', {
    phoneNumber,
    fullName: 'Income Test',
    birthDate: '1990-01-01',
    password,
  });
  console.log('Register:', registerResp.status, registerResp.data);
  assert(registerResp.ok, 'Register failed');

  await sleep(1000);
  const otpEntry = await findOtp(phoneNumber, 'REGISTRATION');
  assert(otpEntry, 'OTP not found for registration');

  const verifyResp = await req('POST', '/auth/verify-phone', { phoneNumber, otpCode: otpEntry.code });
  console.log('Verify:', verifyResp.status, verifyResp.data);
  assert(verifyResp.ok, 'Verify failed');

  let accessToken = verifyResp.data.data.tokens.accessToken;
  assert(accessToken, 'Access token missing');

  // Ensure onboarding completed (skip if needed)
  const finResp = await req('POST', '/onboarding/financial-info', {
    monthlyIncome: 1200,
    basicExpenses: 700,
    financialGoal: 'Test goal',
    primarySpendingCategory: 'Other',
  }, accessToken);
  console.log('Complete financial info:', finResp.status, finResp.data);
  assert(finResp.ok, 'Complete financial info failed');

  const firstGoalResp = await req('POST', '/onboarding/first-goal', {
    icon: '🏆',
    name: 'Initial Goal',
    targetAmount: 500,
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }, accessToken);
  console.log('Create first goal:', firstGoalResp.status, firstGoalResp.data);
  assert(firstGoalResp.ok, 'Create first goal failed');

  // Refresh tokens to pick up onboarding flag in access token
  const refreshToken = verifyResp.data.data.tokens.refreshToken;
  const refreshResp = await req('POST', '/auth/refresh-token', { refreshToken });
  console.log('Refresh after onboarding:', refreshResp.status, refreshResp.data);
  assert(refreshResp.ok, 'Refresh after onboarding failed');
  const updatedAccessToken = refreshResp.data.data.accessToken;
  // replace old accessToken for further requests
  accessToken = updatedAccessToken;

  // Create income
  const createResp = await req('POST', '/incomes', {
    amount: 500.5,
    source: 'Salary',
    description: 'Test salary',
    incomeDate: new Date().toISOString().split('T')[0],
  }, accessToken);
  console.log('Create income:', createResp.status, createResp.data);
  assert(createResp.ok, 'Create income failed');
  const incomeId = createResp.data.data.id;

  // Get incomes
  const listResp = await req('GET', '/incomes', undefined, accessToken);
  console.log('List incomes:', listResp.status, listResp.data);
  assert(listResp.ok, 'List incomes failed');
  assert(Array.isArray(listResp.data.data) && listResp.data.data.find(i => i.id === incomeId), 'Created income missing in list');

  // Get by id
  const byIdResp = await req('GET', `/incomes/${incomeId}`, undefined, accessToken);
  console.log('Get income by id:', byIdResp.status, byIdResp.data);
  assert(byIdResp.ok, 'Get income by id failed');

  // Update income
  const updateResp = await req('PATCH', `/incomes/${incomeId}`, { amount: 600 }, accessToken);
  console.log('Update income:', updateResp.status, updateResp.data);
  assert(updateResp.ok, 'Update income failed');
  assert(updateResp.data.data.amount === 600 || Number(updateResp.data.data.amount) === 600, 'Income amount not updated');

  // Get stats
  const statsResp = await req('GET', '/incomes/stats', undefined, accessToken);
  console.log('Income stats:', statsResp.status, statsResp.data);
  assert(statsResp.ok, 'Income stats failed');

  // Delete income
  const deleteResp = await req('DELETE', `/incomes/${incomeId}`, undefined, accessToken);
  console.log('Delete income:', deleteResp.status, deleteResp.data);
  assert(deleteResp.ok, 'Delete income failed');

  // Verify deletion not returned in list
  const afterDeleteList = await req('GET', '/incomes', undefined, accessToken);
  console.log('Incomes after delete:', afterDeleteList.status, afterDeleteList.data);
  assert(afterDeleteList.ok, 'Get incomes after delete failed');
  assert(!Array.isArray(afterDeleteList.data.data) || !afterDeleteList.data.data.some(i => i.id === incomeId), 'Deleted income still present');

  console.log('Income E2E verification completed successfully');
  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error('Income E2E failed', err.message || err);
  await prisma.$disconnect();
  process.exit(1);
});
