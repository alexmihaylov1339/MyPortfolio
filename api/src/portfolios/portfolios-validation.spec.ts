import { BadRequestException } from '@nestjs/common';

import {
  validateCreatePortfolioInput,
  validateUpdatePortfolioInput,
} from './portfolios-validation';

describe('validateCreatePortfolioInput', () => {
  it('accepts a valid name and normalizes it', () => {
    const result = validateCreatePortfolioInput({ name: '  Retirement  ' });

    expect(result).toEqual({ name: 'Retirement', isDefault: false });
  });

  it('respects an explicit isDefault: true', () => {
    const result = validateCreatePortfolioInput({
      name: 'Retirement',
      isDefault: true,
    });

    expect(result.isDefault).toBe(true);
  });

  it('rejects a missing name', () => {
    expect(() => validateCreatePortfolioInput({ name: '' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a whitespace-only name', () => {
    expect(() => validateCreatePortfolioInput({ name: '   ' })).toThrow(
      BadRequestException,
    );
  });
});

describe('validateUpdatePortfolioInput', () => {
  it('rejects an empty update body', () => {
    expect(() => validateUpdatePortfolioInput({})).toThrow(BadRequestException);
  });

  it('accepts a name-only rename', () => {
    const result = validateUpdatePortfolioInput({ name: '  Personal  ' });

    expect(result).toEqual({ name: 'Personal' });
  });

  it('accepts isDefault: true', () => {
    const result = validateUpdatePortfolioInput({ isDefault: true });

    expect(result).toEqual({ isDefault: true });
  });

  it('rejects isDefault: false — there must always be exactly one default', () => {
    expect(() => validateUpdatePortfolioInput({ isDefault: false })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a blank name on update', () => {
    expect(() => validateUpdatePortfolioInput({ name: '  ' })).toThrow(
      BadRequestException,
    );
  });
});
