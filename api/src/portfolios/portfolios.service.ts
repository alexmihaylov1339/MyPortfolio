import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Portfolio } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PORTFOLIO_ERROR_MESSAGES } from './portfolios-errors';
import {
  toPortfolioResponse,
  type PortfolioResponse,
} from './portfolios.helpers';
import type {
  ValidatedCreatePortfolioInput,
  ValidatedUpdatePortfolioInput,
} from './portfolios-validation';

@Injectable()
export class PortfoliosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string): Promise<PortfolioResponse[]> {
    const portfolios = await this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return portfolios.map(toPortfolioResponse);
  }

  async findOneForUser(userId: string, id: string): Promise<PortfolioResponse> {
    const portfolio = await this.getOwnedPortfolioOrThrow(userId, id);
    return toPortfolioResponse(portfolio);
  }

  async create(
    userId: string,
    input: ValidatedCreatePortfolioInput,
  ): Promise<PortfolioResponse> {
    const existingCount = await this.prisma.portfolio.count({
      where: { userId },
    });
    const isFirstPortfolio = existingCount === 0;
    const isDefault = isFirstPortfolio || input.isDefault;

    const portfolio = await this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.portfolio.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.portfolio.create({
        data: { userId, name: input.name, isDefault },
      });
    });

    return toPortfolioResponse(portfolio);
  }

  async update(
    userId: string,
    id: string,
    input: ValidatedUpdatePortfolioInput,
  ): Promise<PortfolioResponse> {
    await this.getOwnedPortfolioOrThrow(userId, id);

    const portfolio = await this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.portfolio.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.portfolio.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.isDefault !== undefined
            ? { isDefault: input.isDefault }
            : {}),
        },
      });
    });

    return toPortfolioResponse(portfolio);
  }

  /**
   * Deletes a portfolio and everything in it (positions, dividends, models —
   * all cascade). Refuses to delete your only portfolio, since every
   * position/model requires a portfolioId and the rest of the app assumes
   * you always have at least one. If the deleted portfolio was the
   * default, the oldest remaining one is promoted so there's always
   * exactly one default to fall back to.
   */
  async remove(userId: string, id: string): Promise<void> {
    const portfolio = await this.getOwnedPortfolioOrThrow(userId, id);

    const totalCount = await this.prisma.portfolio.count({
      where: { userId },
    });
    if (totalCount <= 1) {
      throw new BadRequestException(
        PORTFOLIO_ERROR_MESSAGES.cannotDeleteLastPortfolio,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.portfolio.delete({ where: { id } });

      if (portfolio.isDefault) {
        const nextDefault = await tx.portfolio.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
        });
        if (nextDefault) {
          await tx.portfolio.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      }
    });
  }

  /**
   * Resolves which portfolio a request should operate on: the requested
   * one (after verifying it belongs to this user — 404s otherwise, never
   * silently falls back, so a stale/foreign id can't leak into someone
   * else's data), or the user's default portfolio when none was specified.
   */
  async resolvePortfolioId(
    userId: string,
    requestedPortfolioId?: string | null,
  ): Promise<string> {
    if (requestedPortfolioId) {
      const portfolio = await this.getOwnedPortfolioOrThrow(
        userId,
        requestedPortfolioId,
      );
      return portfolio.id;
    }

    const defaultPortfolio = await this.getOrCreateDefaultPortfolio(userId);
    return defaultPortfolio.id;
  }

  /**
   * Finds the user's default portfolio, promotes an existing one if the
   * default flag was somehow lost, or creates a fresh "Default" portfolio
   * for a brand-new user who has never had one — so callers never have to
   * handle "no portfolio exists yet" themselves.
   */
  async getOrCreateDefaultPortfolio(userId: string): Promise<Portfolio> {
    const existingDefault = await this.prisma.portfolio.findFirst({
      where: { userId, isDefault: true },
    });
    if (existingDefault) {
      return existingDefault;
    }

    const anyExisting = await this.prisma.portfolio.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (anyExisting) {
      return this.prisma.portfolio.update({
        where: { id: anyExisting.id },
        data: { isDefault: true },
      });
    }

    return this.prisma.portfolio.create({
      data: { userId, name: 'Default', isDefault: true },
    });
  }

  private async getOwnedPortfolioOrThrow(
    userId: string,
    id: string,
  ): Promise<Portfolio> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio || portfolio.userId !== userId) {
      throw new NotFoundException(PORTFOLIO_ERROR_MESSAGES.portfolioNotFound);
    }

    return portfolio;
  }
}
