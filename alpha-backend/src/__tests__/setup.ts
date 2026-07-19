// Global test setup for Jest

// Tell Jest to use our mock for the prisma client module
jest.mock('../lib/prisma', () => {
  return {
    __esModule: true,
    default: require('../lib/__mocks__/prisma').default,
  };
});
