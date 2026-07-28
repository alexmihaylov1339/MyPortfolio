import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { MODEL_ERROR_MESSAGES } from './models-errors';
import type {
  ValidatedCreateModelInput,
  ValidatedUpdateModelInput,
} from './models-validation';
import { toModelResponse, type ModelPortfolioResponse } from './models.helpers';

@Injectable()
export class ModelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portfolios: PortfoliosService,
  ) {}

  async findAllForUser(
    userId: string,
    requestedPortfolioId?: string,
  ): Promise<ModelPortfolioResponse[]> {
    const portfolioId = await this.portfolios.resolvePortfolioId(
      userId,
      requestedPortfolioId,
    );

    const models = await this.prisma.modelPortfolio.findMany({
      where: { userId, portfolioId },
      include: { allocations: true },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(toModelResponse);
  }

  async findOneForUser(
    userId: string,
    id: string,
  ): Promise<ModelPortfolioResponse> {
    const model = await this.getOwnedModelOrThrow(userId, id);
    return toModelResponse(model);
  }

  async create(
    userId: string,
    input: ValidatedCreateModelInput,
  ): Promise<ModelPortfolioResponse> {
    const portfolioId = await this.portfolios.resolvePortfolioId(
      userId,
      input.portfolioId,
    );

    // "First model in this portfolio is automatically default" — scoped per
    // portfolio, not per user, so each portfolio gets its own default model
    // independent of any others.
    const existingCount = await this.prisma.modelPortfolio.count({
      where: { userId, portfolioId },
    });
    const isFirstModel = existingCount === 0;
    const isDefault = isFirstModel || input.isDefault;

    const model = await this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.modelPortfolio.updateMany({
          where: { userId, portfolioId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.modelPortfolio.create({
        data: {
          userId,
          portfolioId,
          name: input.name,
          isDefault,
          allocations: {
            create: input.allocations.map((allocation) => ({
              ticker: allocation.ticker,
              exchangeMicCode: allocation.exchangeMicCode,
              targetPercent: allocation.targetPercent,
            })),
          },
        },
        include: { allocations: true },
      });
    });

    return toModelResponse(model);
  }

  async update(
    userId: string,
    id: string,
    input: ValidatedUpdateModelInput,
  ): Promise<ModelPortfolioResponse> {
    const existing = await this.getOwnedModelOrThrow(userId, id);

    const model = await this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.modelPortfolio.updateMany({
          where: {
            userId,
            portfolioId: existing.portfolioId,
            isDefault: true,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }

      if (input.allocations) {
        await tx.modelAllocation.deleteMany({
          where: { modelPortfolioId: id },
        });
      }

      return tx.modelPortfolio.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.isDefault !== undefined
            ? { isDefault: input.isDefault }
            : {}),
          ...(input.allocations
            ? {
                allocations: {
                  create: input.allocations.map((allocation) => ({
                    ticker: allocation.ticker,
                    exchangeMicCode: allocation.exchangeMicCode,
                    targetPercent: allocation.targetPercent,
                  })),
                },
              }
            : {}),
        },
        include: { allocations: true },
      });
    });

    return toModelResponse(model);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwnedModelOrThrow(userId, id);
    await this.prisma.modelPortfolio.delete({ where: { id } });
  }

  private async getOwnedModelOrThrow(userId: string, id: string) {
    const model = await this.prisma.modelPortfolio.findUnique({
      where: { id },
      include: { allocations: true },
    });

    if (!model || model.userId !== userId) {
      throw new NotFoundException(MODEL_ERROR_MESSAGES.modelNotFound);
    }

    return model;
  }
}
