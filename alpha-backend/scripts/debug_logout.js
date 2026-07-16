const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const baseUrl = 'http://127.0.0.1:3000/api';

async function req(method, path, body, token) {
  const url = `${baseUrl}${path}`;
  const headers = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const options = { method, headers };
  if (body !== undefined) options.body = JSON.stringify(body);
  const resp = await fetch(url, options);
  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch (err) { data = text; }
  return { status: resp.status, data, ok: resp.ok };
}

async function findOtp(phoneNumber, purpose) {
  const otp = await prisma.otpCode.findFirst({
    where: { phoneNumber, purpose, isUsed: false },
    orderBy: { createdAt: 'desc' },
  });
  return otp;
}

async function run() {
  const phoneNumber = '+9627' + String(Date.now()).slice(-8);
  const password = 'StrongPass123!';
  console.log('phone', phoneNumber);

  const reg = await req('POST', '/auth/register', { phoneNumber, fullName: 'Debug User', birthDate: '1995-01-01', password });
  console.log('register', reg.status, reg.data);
  const otp = await findOtp(phoneNumber, 'REGISTRATION');
  console.log('otp', otp && otp.code);
  const verify = await req('POST', '/auth/verify-phone', { phoneNumber, otpCode: otp.code });
  console.log('verify', verify.status, verify.data);
  const access = verify.data.data.tokens.accessToken;
  const refresh = verify.data.data.tokens.refreshToken;
  console.log('initial refresh hash', crypto.createHash('sha256').update(refresh).digest('hex'));

  const refresh1 = await req('POST', '/auth/refresh-token', { refreshToken: refresh });
  console.log('refresh1', refresh1.status, refresh1.data);
  const refreshToken1 = refresh1.data.data.refreshToken;
  console.log('refreshToken1 hash', crypto.createHash('sha256').update(refreshToken1).digest('hex'));

  const profile = await req('POST', '/onboarding/financial-info', { monthlyIncome: 1500, basicExpenses: 800, financialGoal: 'Test', primarySpendingCategory: 'Food' }, refresh1.data.data.accessToken);
  console.log('complete profile', profile.status, profile.data);

  const firstGoal = await req('POST', '/onboarding/first-goal', { icon: '🏦', name: 'Goal', targetAmount: 1000, targetDate: new Date(Date.now()+90*24*60*60*1000).toISOString().split('T')[0] }, refresh1.data.data.accessToken);
  console.log('firstGoal', firstGoal.status, firstGoal.data);

  const refresh2 = await req('POST', '/auth/refresh-token', { refreshToken: refreshToken1 });
  console.log('refresh2', refresh2.status, refresh2.data);
  const refreshToken2 = refresh2.data.data.refreshToken;
  console.log('refreshToken2 hash', crypto.createHash('sha256').update(refreshToken2).digest('hex'));
  const verifyUserId = verify.data.data.user.id;
  const sessionsBefore = await prisma.userSession.findMany({ where: { userId: verifyUserId } });
  console.log('sessions before', sessionsBefore.map(s => ({ id: s.id, createdAt: s.createdAt, isActive: s.isActive, isRevoked: s.isRevoked, expiresAt: s.expiresAt })));
  for (const token of [{ name: 'initial', value: refresh }, { name: 'refresh1', value: refreshToken1 }, { name: 'refresh2', value: refreshToken2 }]) {
    console.log('token', token.name);
    for (const session of sessionsBefore) {
      const match = await bcrypt.compare(token.value, session.refreshTokenHash);
      if (match) {
        console.log('  matches session', session.id, session.createdAt.toISOString());
      }
    }
  }

  const logout = await req('POST', '/auth/logout', { refreshToken: refreshToken2 }, refresh2.data.data.accessToken);
  console.log('logout', logout.status, logout.data);

  const sessionsAfter = await prisma.userSession.findMany({ where: { userId: verify.data.data.user.id } });
  console.log('sessions after', sessionsAfter.map(s => ({ id: s.id, createdAt: s.createdAt, isActive: s.isActive, isRevoked: s.isRevoked, expiresAt: s.expiresAt, revokeReason: s.revokeReason })));

  await prisma.$disconnect();
}

run().catch(async (err) => { console.error(err); await prisma.$disconnect(); process.exit(1); });