jest.mock('@prisma/client', () => {
  const mockPrisma = {
    income: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  };
});

const { PrismaClient } = require('@prisma/client');
const { IncomeService } = require('../dist/services/income.service.js');

describe('IncomeService', () => {
  let service;
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
    service = new IncomeService();
  });

  it('creates income and audit log for a valid request', async () => {
    prisma.income.create.mockResolvedValue({ id: 'income-1', amount: 500, source: 'Salary' });
    prisma.auditLog.create.mockResolvedValue({});

    const result = await service.createIncome('user-1', {
      amount: 500,
      source: 'Salary',
      description: 'Test salary',
      incomeDate: '2026-07-12',
    });

    expect(prisma.income.create).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
    expect(result.id).toBe('income-1');
  });
});
