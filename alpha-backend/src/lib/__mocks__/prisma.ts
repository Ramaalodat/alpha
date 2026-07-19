import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Create a deep mock of the PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Ensure that every time this mock is imported, it resets to a clean state before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Export the mocked instance as default to simulate the actual module export
export default prismaMock;
