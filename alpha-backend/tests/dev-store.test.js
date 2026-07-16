const path = require('path');
const fs = require('fs');

const { createDevStore } = require('../dist/utils/devStore');

jest.setTimeout(30000);

describe('dev store fallback persistence', () => {
  it('persists a user and OTP locally', async () => {
    const storePath = path.join(__dirname, '..', '.tmp-dev-store.json');
    if (fs.existsSync(storePath)) {
      fs.unlinkSync(storePath);
    }

    const store = createDevStore({ filePath: storePath });

    const user = await store.createUser({
      id: 'user-1',
      phoneNumber: '0790000000',
      fullName: 'Test User',
      birthDate: new Date('1995-01-01'),
      passwordHash: 'hash',
      status: 'PENDING_VERIFICATION',
      isOnboarded: false,
    });

    expect(user.phoneNumber).toBe('+962790000000');

    const otp = await store.createOtp({
      phoneNumber: '0790000000',
      code: '123456',
      purpose: 'REGISTRATION',
      expiresAt: new Date(Date.now() + 60000),
    });

    expect(otp.code).toBe('123456');

    const persisted = await store.findUserByPhone('0790000000');
    expect(persisted).toBeDefined();
  });
});
