import { BadRequestException } from '@nestjs/common';

import {
  validateCreateModelInput,
  validateUpdateModelInput,
} from './models-validation';
import type { CreateModelDto } from './dto/create-model.dto';

describe('validateCreateModelInput', () => {
  const validBody: CreateModelDto = {
    name: 'Growth',
    allocations: [
      { ticker: 'aapl', targetPercent: '60' },
      { ticker: 'msft', targetPercent: '40' },
    ],
  };

  it('accepts a valid model and normalizes name/ticker', () => {
    const result = validateCreateModelInput(validBody);

    expect(result.name).toBe('Growth');
    expect(result.isDefault).toBe(false);
    expect(result.allocations).toEqual([
      { ticker: 'AAPL', targetPercent: '60' },
      { ticker: 'MSFT', targetPercent: '40' },
    ]);
  });

  it('rejects a missing name', () => {
    expect(() => validateCreateModelInput({ ...validBody, name: '' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects an empty allocations array', () => {
    expect(() =>
      validateCreateModelInput({ ...validBody, allocations: [] }),
    ).toThrow(BadRequestException);
  });

  it('rejects a duplicate ticker (case-insensitive)', () => {
    expect(() =>
      validateCreateModelInput({
        ...validBody,
        allocations: [
          { ticker: 'AAPL', targetPercent: '50' },
          { ticker: 'aapl', targetPercent: '50' },
        ],
      }),
    ).toThrow(BadRequestException);
  });

  it.each(['0', '-5', 'abc', ''])(
    'rejects a non-positive targetPercent %p',
    (targetPercent) => {
      expect(() =>
        validateCreateModelInput({
          ...validBody,
          allocations: [{ ticker: 'AAPL', targetPercent }],
        }),
      ).toThrow(BadRequestException);
    },
  );

  it('rejects allocations that sum to less than 100', () => {
    // A classic even three-way split (33.33 x 3 = 99.99) does NOT sum to
    // 100 exactly. These are user-typed target numbers, not calculated
    // ones, so no rounding tolerance is applied — the user must enter
    // values that actually sum to 100 (e.g. 33.33/33.33/33.34).
    expect(() =>
      validateCreateModelInput({
        name: 'Thirds',
        allocations: [
          { ticker: 'AAPL', targetPercent: '33.33' },
          { ticker: 'MSFT', targetPercent: '33.33' },
          { ticker: 'VOO', targetPercent: '33.33' },
        ],
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts allocations that sum to exactly 100 with uneven decimals', () => {
    const result = validateCreateModelInput({
      name: 'Thirds',
      allocations: [
        { ticker: 'AAPL', targetPercent: '33.33' },
        { ticker: 'MSFT', targetPercent: '33.33' },
        { ticker: 'VOO', targetPercent: '33.34' },
      ],
    });

    expect(result.allocations).toHaveLength(3);
  });

  it('rejects allocations that sum to more than 100', () => {
    expect(() =>
      validateCreateModelInput({
        ...validBody,
        allocations: [
          { ticker: 'AAPL', targetPercent: '60' },
          { ticker: 'MSFT', targetPercent: '41' },
        ],
      }),
    ).toThrow(BadRequestException);
  });

  it('respects an explicit isDefault: true', () => {
    const result = validateCreateModelInput({
      ...validBody,
      isDefault: true,
    });

    expect(result.isDefault).toBe(true);
  });
});

describe('validateUpdateModelInput', () => {
  it('rejects an empty update body', () => {
    expect(() => validateUpdateModelInput({})).toThrow(BadRequestException);
  });

  it('accepts a name-only update', () => {
    const result = validateUpdateModelInput({ name: 'Renamed' });

    expect(result).toEqual({ name: 'Renamed' });
  });

  it('accepts an isDefault-only update', () => {
    const result = validateUpdateModelInput({ isDefault: false });

    expect(result).toEqual({ isDefault: false });
  });

  it('validates allocations the same way as create when provided', () => {
    expect(() =>
      validateUpdateModelInput({
        allocations: [
          { ticker: 'AAPL', targetPercent: '50' },
          { ticker: 'MSFT', targetPercent: '49' },
        ],
      }),
    ).toThrow(BadRequestException);
  });

  it('leaves allocations untouched (undefined) when omitted from the update', () => {
    const result = validateUpdateModelInput({ name: 'Renamed' });

    expect(result.allocations).toBeUndefined();
  });
});
