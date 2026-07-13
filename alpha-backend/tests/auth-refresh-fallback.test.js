const fs = require('fs');
const os = require('os');
const path = require('path');

jest.setTimeout(60000);

describe('auth fallback refresh token', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    
    originalCwd = process.cwd();

    // Load project .env into process.env so tests can use Neon DATABASE_URL even after chdir
    const projectEnvPath = path.join(originalCwd, '.env');
    if (fs.existsSync(projectEnvPath)) { require('dotenv').config({ path: projectEnvPath }); }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'basira-refresh-'));
    process.chdir(tempDir);
    // Prefer DATABASE_URL from environment (.env / Neon). Only set a local fallback when not provided.
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/basira_db?schema=public';
    process.env.JWT_ACCESS_SECRET = 'your-super-secret-jwt-access-key-change-in-production-minimum-64-chars-abcdefghijklmnop';
    process.env.JWT_REFRESH_SECRET = 'your-different-super-secret-jwt-refresh-key-change-in-production-minimum-64-chars-xyz';
    
    process.env.FORCE_DEV_FALLBACK = '1';
    jest.resetModules();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('refreshes tokens when using the local fallback store', async () => {
    const { AuthService } = require('../dist/services/auth.service');
    const authService = new AuthService();

    const phoneNumber = '0790000666';

    await authService.register({
      phoneNumber,
      fullName: 'Refresh Tester',
      birthDate: '1995-01-01',
      password: 'Password123!',
    });

    const storePath = path.join(tempDir, '.dev-store.json');
    const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    const latestOtp = storeData.otps[storeData.otps.length - 1];

    const verified = await authService.verifyPhone(phoneNumber, latestOtp.code);
    expect(verified.user.status).toBe('VERIFIED');

    const loggedIn = await authService.login({
      phoneNumber,
      password: 'Password123!',
    });

    const refreshed = await authService.refreshAccessToken({
      refreshToken: loggedIn.tokens.refreshToken,
    });

    expect(refreshed.accessToken).toBeDefined();
    expect(refreshed.refreshToken).toBeDefined();
  });
});



