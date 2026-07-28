import { BadRequestException } from '@nestjs/common';

import { hasTrimmedText, isUndefined } from '../common/utils';

import type { CreatePortfolioDto } from './dto/create-portfolio.dto';
import type { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PORTFOLIO_ERROR_MESSAGES } from './portfolios-errors';

export interface ValidatedCreatePortfolioInput {
  name: string;
  isDefault: boolean;
}

export interface ValidatedUpdatePortfolioInput {
  name?: string;
  isDefault?: true;
}

export function validateCreatePortfolioInput(
  body: CreatePortfolioDto,
): ValidatedCreatePortfolioInput {
  if (!body || !hasTrimmedText(body.name)) {
    throw new BadRequestException(PORTFOLIO_ERROR_MESSAGES.nameRequired);
  }

  return {
    name: body.name.trim(),
    isDefault: body.isDefault ?? false,
  };
}

export function validateUpdatePortfolioInput(
  body: UpdatePortfolioDto,
): ValidatedUpdatePortfolioInput {
  if (!body || Object.keys(body).length === 0) {
    throw new BadRequestException(PORTFOLIO_ERROR_MESSAGES.updateRequiresField);
  }

  const result: ValidatedUpdatePortfolioInput = {};

  if (!isUndefined(body.name)) {
    if (!hasTrimmedText(body.name)) {
      throw new BadRequestException(PORTFOLIO_ERROR_MESSAGES.nameRequired);
    }
    result.name = body.name.trim();
  }

  if (!isUndefined(body.isDefault)) {
    // There is always exactly one default portfolio — the only supported
    // transition is "make this one the default" (which unsets the old
    // one), never "unset this one" with nothing to take its place.
    if (body.isDefault !== true) {
      throw new BadRequestException(
        PORTFOLIO_ERROR_MESSAGES.cannotUnsetDefault,
      );
    }
    result.isDefault = true;
  }

  return result;
}
