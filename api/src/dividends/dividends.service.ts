import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { DIVIDEND_ERROR_MESSAGES } from './dividends-errors';
import { toDividendResponse, type DividendResponse } from './dividends.helpers';
import type { ValidatedDividendInput } from './dividends-validation';

@Injectable()
export class DividendsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForPosition(
    userId: string,
    positionId: string,
  ): Promise<DividendResponse[]> {
    await this.getOwnedPositionOrThrow(userId, positionId);

    const dividends = await this.prisma.dividend.findMany({
      where: { positionId },
      orderBy: { receivedAt: 'desc' },
    });

    return dividends.map(toDividendResponse);
  }

  async create(
    userId: string,
    positionId: string,
    input: ValidatedDividendInput,
  ): Promise<DividendResponse> {
    await this.getOwnedPositionOrThrow(userId, positionId);

    const dividend = await this.prisma.dividend.create({
      data: {
        positionId,
        amount: input.amount,
        ...(input.receivedAt ? { receivedAt: input.receivedAt } : {}),
      },
    });

    return toDividendResponse(dividend);
  }

  async remove(
    userId: string,
    positionId: string,
    dividendId: string,
  ): Promise<void> {
    await this.getOwnedPositionOrThrow(userId, positionId);

    const dividend = await this.prisma.dividend.findUnique({
      where: { id: dividendId },
    });

    if (!dividend || dividend.positionId !== positionId) {
      throw new NotFoundException(DIVIDEND_ERROR_MESSAGES.dividendNotFound);
    }

    await this.prisma.dividend.delete({ where: { id: dividendId } });
  }

  private async getOwnedPositionOrThrow(userId: string, positionId: string) {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position || position.userId !== userId) {
      throw new NotFoundException(DIVIDEND_ERROR_MESSAGES.positionNotFound);
    }

    return position;
  }
}
