import { Injectable, NotFoundException } from '@nestjs/common';
import type { PositionStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { POSITION_ERROR_MESSAGES } from './positions-errors';
import {
  calculatePositionsSummary,
  type PositionsSummaryResponse,
} from './positions-summary';
import type {
  ValidatedPositionInput,
  ValidatedPositionUpdateInput,
} from './positions-validation';
import { toPositionResponse, type PositionResponse } from './positions.helpers';

@Injectable()
export class PositionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portfolios: PortfoliosService,
  ) {}

  async findAllForUser(
    userId: string,
    status?: PositionStatus,
    requestedPortfolioId?: string,
  ): Promise<PositionResponse[]> {
    const portfolioId = await this.portfolios.resolvePortfolioId(
      userId,
      requestedPortfolioId,
    );

    const positions = await this.prisma.position.findMany({
      where: { userId, portfolioId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    });

    return positions.map(toPositionResponse);
  }

  async getSummaryForUser(
    userId: string,
    requestedPortfolioId?: string,
  ): Promise<PositionsSummaryResponse> {
    const portfolioId = await this.portfolios.resolvePortfolioId(
      userId,
      requestedPortfolioId,
    );

    const positions = await this.prisma.position.findMany({
      where: { userId, portfolioId },
    });

    return calculatePositionsSummary(positions);
  }

  async findOneForUser(userId: string, id: string): Promise<PositionResponse> {
    const position = await this.getOwnedPositionOrThrow(userId, id);
    return toPositionResponse(position);
  }

  async create(
    userId: string,
    input: ValidatedPositionInput,
  ): Promise<PositionResponse> {
    const portfolioId = await this.portfolios.resolvePortfolioId(
      userId,
      input.portfolioId,
    );

    const position = await this.prisma.position.create({
      data: {
        userId,
        portfolioId,
        broker: input.broker,
        ticker: input.ticker,
        exchangeMicCode: input.exchangeMicCode,
        name: input.name,
        assetType: input.assetType,
        quantity: input.quantity,
        averageBuyPrice: input.averageBuyPrice,
        currency: input.currency,
        status: input.status,
        ...(input.openedAt ? { openedAt: input.openedAt } : {}),
        closedAt: input.closedAt,
        closePrice: input.closePrice,
      },
    });

    return toPositionResponse(position);
  }

  async update(
    userId: string,
    id: string,
    input: ValidatedPositionUpdateInput,
  ): Promise<PositionResponse> {
    await this.getOwnedPositionOrThrow(userId, id);

    const position = await this.prisma.position.update({
      where: { id },
      data: input,
    });

    return toPositionResponse(position);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwnedPositionOrThrow(userId, id);
    await this.prisma.position.delete({ where: { id } });
  }

  private async getOwnedPositionOrThrow(userId: string, id: string) {
    const position = await this.prisma.position.findUnique({ where: { id } });

    if (!position || position.userId !== userId) {
      throw new NotFoundException(POSITION_ERROR_MESSAGES.positionNotFound);
    }

    return position;
  }
}
