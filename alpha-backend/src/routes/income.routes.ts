import { FastifyInstance } from 'fastify';
import { incomeController } from '../controllers/income.controller';
import { authenticate, requireOnboarding } from '../middleware/auth.middleware';
import { validate, createIncomeSchema, updateIncomeSchema } from '../middleware/validation.middleware';

const incomeEntrySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    amount: { type: 'number' },
    source: { type: 'string' },
    description: { type: 'string' },
    frequency: { type: 'string' },
    incomeDate: { type: 'string', format: 'date-time' },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    isActive: { type: 'boolean' },
    isRecurring: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: ['string', 'null'], format: 'date-time' },
  },
};

const incomeApiResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: ['string', 'null'] },
    // data may be an object, an array (for lists), or null; allow additional properties so Fastify doesn't strip returned objects
    data: { type: ['object', 'array', 'null'], additionalProperties: true },
    meta: {
      type: 'object',
      properties: {
        timestamp: { type: 'string' },
        version: { type: 'string' },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

const incomeListApiResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: ['string', 'null'] },
    data: { type: 'array', items: incomeEntrySchema },
    meta: {
      type: 'object',
      properties: {
        timestamp: { type: 'string' },
        version: { type: 'string' },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

export const incomeRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(async (instance) => {
    instance.addHook('onRequest', authenticate);
    instance.addHook('onRequest', requireOnboarding);

    // Create income
    instance.post(
      '/',
      {
        preHandler: [validate(createIncomeSchema)],
        schema: {
          tags: ['Income'],
          summary: 'Create income',
          description: 'Create a new income entry for the authenticated user',
          body: {
            type: 'object',
            properties: {
              amount: { type: 'number' },
              source: { type: 'string' },
              description: { type: 'string' },
              incomeDate: { type: 'string', format: 'date-time' },
              isRecurring: { type: 'boolean' },
              frequency: { type: 'string' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
            },
          },
          response: {
            201: incomeApiResponseSchema,
          },
        },
      },
      incomeController.createIncome
    );

    // Get incomes
    instance.get('/', {
      schema: {
        tags: ['Income'],
        summary: 'List incomes',
        description: 'List income entries for the authenticated user',
        response: {
          200: incomeListApiResponseSchema,
        },
      },
    }, incomeController.getUserIncomes);

    // Get income stats
    instance.get('/stats', {
      schema: {
        tags: ['Income'],
        summary: 'Income stats',
        description: 'Get income totals for the auth user',
      },
    }, incomeController.getIncomeStats);

    // Get monthly comparison
    instance.get('/monthly-comparison', {
      schema: {
        tags: ['Income'],
        summary: 'Monthly comparison',
        description: 'Compare current vs last month income',
      },
    }, incomeController.getMonthlyComparison);

    // Get by id
    instance.get('/:incomeId', {
      schema: {
        tags: ['Income'],
        summary: 'Get income by id',
        description: 'Fetch one income entry by id',
        response: {
          200: incomeApiResponseSchema,
        },
      },
    }, incomeController.getIncomeById);

    // Update
    instance.patch('/:incomeId', {
      preHandler: [validate(updateIncomeSchema)],
      schema: {
        tags: ['Income'],
        summary: 'Update income',
        description: 'Update an existing income entry',
        response: {
          200: incomeApiResponseSchema,
        },
      },
    }, incomeController.updateIncome);

    // Delete
    instance.delete('/:incomeId', {
      schema: {
        tags: ['Income'],
        summary: 'Delete income',
        description: 'Soft-delete an income entry',
      },
    }, incomeController.deleteIncome);
  });
};
