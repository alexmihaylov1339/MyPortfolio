import { BadRequestException } from '@nestjs/common';

import { hasTrimmedText } from '../common/utils';

import type { CreateDividendDto } from './dto/create-dividend.dto';
import { DIVIDEND_ERROR_MESSAGES } from './dividends-errors';

export interface ValidatedDividendInput {
  amount: string;
  receivedAt?: Date;
}

function isPositiveDecimalString(value: unknown): value is string {
  if (!hasTrimmedText(value)) {
    return false;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function validateCreateDividendInput(
  body: CreateDividendDto,
): ValidatedDividendInput {
  if (!isPositiveDecimalString(body?.amount)) {
    throw new BadRequestException(DIVIDEND_ERROR_MESSAGES.amountInvalid);
  }

  let receivedAt: Date | undefined;
  if (body.receivedAt) {
    receivedAt = new Date(body.receivedAt);
    if (Number.isNaN(receivedAt.getTime())) {
      throw new BadRequestException(DIVIDEND_ERROR_MESSAGES.receivedAtInvalid);
    }
  }

  return {
    amount: body.amount.trim(),
    receivedAt,
  };
}
