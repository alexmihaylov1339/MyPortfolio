import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { hasTrimmedText, isUndefined } from '../common/utils';

import type {
  CreateModelDto,
  CreateModelAllocationDto,
} from './dto/create-model.dto';
import type {
  UpdateModelDto,
  UpdateModelAllocationDto,
} from './dto/update-model.dto';
import { MODEL_ERROR_MESSAGES } from './models-errors';

export interface ValidatedAllocationInput {
  ticker: string;
  targetPercent: string;
}

export interface ValidatedCreateModelInput {
  name: string;
  isDefault: boolean;
  allocations: ValidatedAllocationInput[];
}

export interface ValidatedUpdateModelInput {
  name?: string;
  isDefault?: boolean;
  allocations?: ValidatedAllocationInput[];
}

const TARGET_PERCENT_TOTAL = new Prisma.Decimal('100');

function isPositiveDecimalString(value: unknown): value is string {
  if (!hasTrimmedText(value)) {
    return false;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function validateAllocations(allocations: unknown): ValidatedAllocationInput[] {
  if (!Array.isArray(allocations) || allocations.length === 0) {
    throw new BadRequestException(MODEL_ERROR_MESSAGES.allocationsRequired);
  }

  const validated: ValidatedAllocationInput[] = (
    allocations as Array<CreateModelAllocationDto | UpdateModelAllocationDto>
  ).map((allocation) => {
    if (!hasTrimmedText(allocation?.ticker)) {
      throw new BadRequestException(
        MODEL_ERROR_MESSAGES.allocationTickerRequired,
      );
    }

    if (!isPositiveDecimalString(allocation.targetPercent)) {
      throw new BadRequestException(
        MODEL_ERROR_MESSAGES.allocationTargetPercentInvalid,
      );
    }

    return {
      ticker: allocation.ticker.trim().toUpperCase(),
      targetPercent: allocation.targetPercent.trim(),
    };
  });

  const tickers = validated.map((allocation) => allocation.ticker);
  if (new Set(tickers).size !== tickers.length) {
    throw new BadRequestException(MODEL_ERROR_MESSAGES.duplicateTicker);
  }

  const total = validated.reduce(
    (sum, allocation) => sum.plus(new Prisma.Decimal(allocation.targetPercent)),
    new Prisma.Decimal(0),
  );

  if (!total.equals(TARGET_PERCENT_TOTAL)) {
    throw new BadRequestException(MODEL_ERROR_MESSAGES.percentagesMustSumTo100);
  }

  return validated;
}

export function validateCreateModelInput(
  body: CreateModelDto,
): ValidatedCreateModelInput {
  if (!body || !hasTrimmedText(body.name)) {
    throw new BadRequestException(MODEL_ERROR_MESSAGES.nameRequired);
  }

  const allocations = validateAllocations(body.allocations);

  return {
    name: body.name.trim(),
    isDefault: body.isDefault ?? false,
    allocations,
  };
}

export function validateUpdateModelInput(
  body: UpdateModelDto,
): ValidatedUpdateModelInput {
  if (!body || Object.keys(body).length === 0) {
    throw new BadRequestException(MODEL_ERROR_MESSAGES.updateRequiresField);
  }

  const result: ValidatedUpdateModelInput = {};

  if (!isUndefined(body.name)) {
    if (!hasTrimmedText(body.name)) {
      throw new BadRequestException(MODEL_ERROR_MESSAGES.nameRequired);
    }
    result.name = body.name.trim();
  }

  if (!isUndefined(body.isDefault)) {
    result.isDefault = body.isDefault;
  }

  if (!isUndefined(body.allocations)) {
    result.allocations = validateAllocations(body.allocations);
  }

  return result;
}
