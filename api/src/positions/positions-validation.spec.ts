import { BadRequestException } from '@nestjs/common';

import {
  validateCreatePositionInput,
  validateListPositionsQuery,
  validateUpdatePositionInput,
} from './positions-validation';
import type { CreatePositionDto } from './dto/create-position.dto';

describe('validateCreatePositionInput', () => {
  const validBody: CreatePositionDto = {
    broker: 'REVOLUT',
    ticker: 'aapl',
    quantity: '10.5',
    averageBuyPrice: '150.25',
  };

  it('accepts a valid open position and normalizes ticker/currency', () => {
    const result = validateCreatePositionInput(validBody);

    expect(result).toMatchObject({
      broker: 'REVOLUT',
      ticker: 'AAPL',
      quantity: '10.5',
      averageBuyPrice: '150.25',
      currency: 'USD',
      status: 'OPEN',
    });
  });

  it('rejects an invalid broker', () => {
    expect(() =>
      validateCreatePositionInput({ ...validBody, broker: 'BOGUS' }),
    ).toThrow(BadRequestException);
  });

  it.each(['0', '-5', 'abc', ''])(
    'rejects a non-positive quantity %p',
    (quantity) => {
      expect(() =>
        validateCreatePositionInput({ ...validBody, quantity }),
      ).toThrow(BadRequestException);
    },
  );

  it('requires closedAt when status is CLOSED', () => {
    expect(() =>
      validateCreatePositionInput({ ...validBody, status: 'CLOSED' }),
    ).toThrow(BadRequestException);
  });

  it('accepts CLOSED status when closedAt is provided', () => {
    const result = validateCreatePositionInput({
      ...validBody,
      status: 'CLOSED',
      closedAt: '2026-07-01',
    });

    expect(result.status).toBe('CLOSED');
    expect(result.closedAt).toEqual(new Date('2026-07-01'));
  });
});

describe('validateUpdatePositionInput', () => {
  it('rejects an empty update body', () => {
    expect(() => validateUpdatePositionInput({})).toThrow(BadRequestException);
  });

  it('requires closedAt when status is set to CLOSED in the same request', () => {
    expect(() => validateUpdatePositionInput({ status: 'CLOSED' })).toThrow(
      BadRequestException,
    );
  });

  it('accepts status CLOSED when closedAt is included in the same request', () => {
    const result = validateUpdatePositionInput({
      status: 'CLOSED',
      closedAt: '2026-07-01',
    });

    expect(result.status).toBe('CLOSED');
    expect(result.closedAt).toEqual(new Date('2026-07-01'));
  });

  it('accepts a partial update with only quantity', () => {
    const result = validateUpdatePositionInput({ quantity: '20' });

    expect(result).toEqual({ quantity: '20' });
  });

  it('rejects a non-positive quantity on update', () => {
    expect(() => validateUpdatePositionInput({ quantity: '0' })).toThrow(
      BadRequestException,
    );
  });
});

describe('validateListPositionsQuery', () => {
  it('returns no filter when status is omitted', () => {
    expect(validateListPositionsQuery({})).toEqual({});
  });

  it('returns no filter when status is an empty string', () => {
    expect(validateListPositionsQuery({ status: '' })).toEqual({});
  });

  it('rejects an invalid status filter', () => {
    expect(() => validateListPositionsQuery({ status: 'BOGUS' })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a valid status filter', () => {
    expect(validateListPositionsQuery({ status: 'CLOSED' })).toEqual({
      status: 'CLOSED',
    });
  });
});
