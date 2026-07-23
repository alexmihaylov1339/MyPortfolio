import { BadRequestException } from '@nestjs/common';
import { AssetType, Broker, PositionStatus } from '@prisma/client';

import { hasTrimmedText, isUndefined } from '../common/utils';

import type { CreatePositionDto } from './dto/create-position.dto';
import type { ListPositionsQueryDto } from './dto/list-positions.dto';
import type { UpdatePositionDto } from './dto/update-position.dto';
import { POSITION_ERROR_MESSAGES } from './positions-errors';

export interface ValidatedPositionInput {
  broker: Broker;
  ticker: string;
  exchangeMicCode?: string;
  name?: string;
  assetType: AssetType;
  quantity: string;
  averageBuyPrice: string;
  currency: string;
  status: PositionStatus;
  openedAt?: Date;
  closedAt?: Date;
  closePrice?: string;
}

export interface ValidatedPositionUpdateInput {
  broker?: Broker;
  ticker?: string;
  exchangeMicCode?: string;
  name?: string;
  assetType?: AssetType;
  quantity?: string;
  averageBuyPrice?: string;
  currency?: string;
  status?: PositionStatus;
  openedAt?: Date;
  closedAt?: Date | null;
  closePrice?: string | null;
}

export interface ValidatedPositionListQuery {
  status?: PositionStatus;
}

function isPositiveDecimalString(value: unknown): value is string {
  if (!hasTrimmedText(value)) {
    return false;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function isBroker(value: unknown): value is Broker {
  return (
    hasTrimmedText(value) && (Object.values(Broker) as string[]).includes(value)
  );
}

function isAssetType(value: unknown): value is AssetType {
  return (
    hasTrimmedText(value) &&
    (Object.values(AssetType) as string[]).includes(value)
  );
}

function isPositionStatus(value: unknown): value is PositionStatus {
  return (
    hasTrimmedText(value) &&
    (Object.values(PositionStatus) as string[]).includes(value)
  );
}

function parseDate(value: string, errorMessage: string): Date {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(errorMessage);
  }

  return parsed;
}

export function validateCreatePositionInput(
  body: CreatePositionDto,
): ValidatedPositionInput {
  if (!body || !isBroker(body.broker)) {
    throw new BadRequestException(POSITION_ERROR_MESSAGES.brokerInvalid);
  }

  if (!hasTrimmedText(body.ticker)) {
    throw new BadRequestException(POSITION_ERROR_MESSAGES.tickerRequired);
  }

  if (!isUndefined(body.assetType) && !isAssetType(body.assetType)) {
    throw new BadRequestException(POSITION_ERROR_MESSAGES.assetTypeInvalid);
  }

  if (!isPositiveDecimalString(body.quantity)) {
    throw new BadRequestException(POSITION_ERROR_MESSAGES.quantityInvalid);
  }

  if (!isPositiveDecimalString(body.averageBuyPrice)) {
    throw new BadRequestException(
      POSITION_ERROR_MESSAGES.averageBuyPriceInvalid,
    );
  }

  if (!isUndefined(body.status) && !isPositionStatus(body.status)) {
    throw new BadRequestException(POSITION_ERROR_MESSAGES.statusInvalid);
  }

  const status = body.status ?? PositionStatus.OPEN;
  const closedAt = body.closedAt
    ? parseDate(body.closedAt, POSITION_ERROR_MESSAGES.closedAtInvalid)
    : undefined;

  if (status === PositionStatus.CLOSED && !closedAt) {
    throw new BadRequestException(
      POSITION_ERROR_MESSAGES.closedAtRequiredWhenClosed,
    );
  }

  if (
    status === PositionStatus.CLOSED &&
    !isPositiveDecimalString(body.closePrice)
  ) {
    throw new BadRequestException(
      POSITION_ERROR_MESSAGES.closePriceRequiredWhenClosed,
    );
  }

  return {
    broker: body.broker,
    ticker: body.ticker.trim().toUpperCase(),
    exchangeMicCode: body.exchangeMicCode?.trim() || undefined,
    name: body.name?.trim() || undefined,
    assetType: body.assetType ?? AssetType.STOCK,
    quantity: body.quantity.trim(),
    averageBuyPrice: body.averageBuyPrice.trim(),
    currency: body.currency?.trim().toUpperCase() || 'USD',
    status,
    openedAt: body.openedAt
      ? parseDate(body.openedAt, POSITION_ERROR_MESSAGES.openedAtInvalid)
      : undefined,
    closedAt,
    closePrice:
      status === PositionStatus.CLOSED ? body.closePrice?.trim() : undefined,
  };
}

export function validateUpdatePositionInput(
  body: UpdatePositionDto,
): ValidatedPositionUpdateInput {
  if (!body || Object.keys(body).length === 0) {
    throw new BadRequestException(POSITION_ERROR_MESSAGES.updateRequiresField);
  }

  const result: ValidatedPositionUpdateInput = {};

  if (!isUndefined(body.broker)) {
    if (!isBroker(body.broker)) {
      throw new BadRequestException(POSITION_ERROR_MESSAGES.brokerInvalid);
    }
    result.broker = body.broker;
  }

  if (!isUndefined(body.ticker)) {
    if (!hasTrimmedText(body.ticker)) {
      throw new BadRequestException(POSITION_ERROR_MESSAGES.tickerRequired);
    }
    result.ticker = body.ticker.trim().toUpperCase();
  }

  if (!isUndefined(body.exchangeMicCode)) {
    result.exchangeMicCode = body.exchangeMicCode?.trim() || undefined;
  }

  if (!isUndefined(body.name)) {
    result.name = body.name?.trim() || undefined;
  }

  if (!isUndefined(body.assetType)) {
    if (!isAssetType(body.assetType)) {
      throw new BadRequestException(POSITION_ERROR_MESSAGES.assetTypeInvalid);
    }
    result.assetType = body.assetType;
  }

  if (!isUndefined(body.quantity)) {
    if (!isPositiveDecimalString(body.quantity)) {
      throw new BadRequestException(POSITION_ERROR_MESSAGES.quantityInvalid);
    }
    result.quantity = body.quantity.trim();
  }

  if (!isUndefined(body.averageBuyPrice)) {
    if (!isPositiveDecimalString(body.averageBuyPrice)) {
      throw new BadRequestException(
        POSITION_ERROR_MESSAGES.averageBuyPriceInvalid,
      );
    }
    result.averageBuyPrice = body.averageBuyPrice.trim();
  }

  if (!isUndefined(body.currency)) {
    result.currency = body.currency?.trim().toUpperCase() || undefined;
  }

  if (!isUndefined(body.status)) {
    if (!isPositionStatus(body.status)) {
      throw new BadRequestException(POSITION_ERROR_MESSAGES.statusInvalid);
    }
    result.status = body.status;
  }

  if (!isUndefined(body.openedAt)) {
    result.openedAt = parseDate(
      body.openedAt,
      POSITION_ERROR_MESSAGES.openedAtInvalid,
    );
  }

  if (!isUndefined(body.closedAt)) {
    result.closedAt = body.closedAt
      ? parseDate(body.closedAt, POSITION_ERROR_MESSAGES.closedAtInvalid)
      : null;
  }

  if (!isUndefined(body.closePrice)) {
    if (body.closePrice && !isPositiveDecimalString(body.closePrice)) {
      throw new BadRequestException(
        POSITION_ERROR_MESSAGES.closePriceRequiredWhenClosed,
      );
    }
    result.closePrice = body.closePrice?.trim() || null;
  }

  if (result.status === PositionStatus.CLOSED && !result.closedAt) {
    throw new BadRequestException(
      POSITION_ERROR_MESSAGES.closedAtRequiredWhenClosed,
    );
  }

  if (
    result.status === PositionStatus.CLOSED &&
    !isPositiveDecimalString(result.closePrice)
  ) {
    throw new BadRequestException(
      POSITION_ERROR_MESSAGES.closePriceRequiredWhenClosed,
    );
  }

  return result;
}

export function validateListPositionsQuery(
  query: ListPositionsQueryDto,
): ValidatedPositionListQuery {
  if (isUndefined(query.status) || query.status === '') {
    return {};
  }

  if (!isPositionStatus(query.status)) {
    throw new BadRequestException(POSITION_ERROR_MESSAGES.statusInvalid);
  }

  return { status: query.status };
}
