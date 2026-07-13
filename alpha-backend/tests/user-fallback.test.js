const fs = require('fs');
const os = require('os');
const path = require('path');

jest.setTimeout(30000);

describe('user fallback service', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    
    originalCwd = process.cwd();

    // Load project .env into process.env so tests can use Neon DATABASE_URL even after chdir
    const projectEnvPath = path.join(originalCwd, '.env');
    if (fs.existsSync(projectEnvPath)) { require('dotenv').config({ path: projectEnvPath }); }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'basira-user-'));
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

  it('loads a registered user from the local fallback store', async () => {
    const { AuthService } = require('../dist/services/auth.service');
    const { UserService } = require('../dist/services/user.service');

    const authService = new AuthService();
    const userService = new UserService();

    const registration = await authService.register({
      phoneNumber: '0791111111',
      fullName: 'Fallback User',
      birthDate: '1995-01-01',
      password: 'Password123!',
    });

    const user = await userService.getUserById(registration.user.id);

    expect(user).toBeDefined();
    expect(user.phoneNumber).toBe('+962791111111');
  });
});



