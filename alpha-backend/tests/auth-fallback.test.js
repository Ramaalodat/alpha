const fs = require('fs');
const os = require('os');
const path = require('path');

jest.setTimeout(30000);

describe('auth fallback phone verification', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    
    originalCwd = process.cwd();

    // Load project .env into process.env so tests can use Neon DATABASE_URL even after chdir
    const projectEnvPath = path.join(originalCwd, '.env');
    if (fs.existsSync(projectEnvPath)) { require('dotenv').config({ path: projectEnvPath }); }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'basira-auth-'));
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

  it('verifies a phone number successfully using the local fallback store', async () => {
    const { AuthService } = require('../dist/services/auth.service');

    const authService = new AuthService();
    const phoneNumber = '0790000555';

    await authService.register({
      phoneNumber,
      fullName: 'Fallback Tester',
      birthDate: '1995-01-01',
      password: 'Password123!',
    });

    const storePath = path.join(tempDir, '.dev-store.json');
    const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    const latestOtp = storeData.otps[storeData.otps.length - 1];

    const result = await authService.verifyPhone(phoneNumber, latestOtp.code);

    expect(result.user.status).toBe('VERIFIED');
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });
});



