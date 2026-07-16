const { normalizeFilterQuery } = require('../dist/utils/query.utils.js');

describe('normalizeFilterQuery', () => {
  it('maps snake_case filters to camelCase and parses values', () => {
    const result = normalizeFilterQuery({
      category_id: 'cat-1',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      min_amount: '10',
      max_amount: '20',
      payment_method: 'CARD',
      is_recurring: 'true',
      tags: 'food,groceries',
    });

    expect(result).toEqual({
      categoryId: 'cat-1',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      minAmount: 10,
      maxAmount: 20,
      paymentMethod: 'CARD',
      isRecurring: true,
      tags: ['food', 'groceries'],
    });
  });
});
