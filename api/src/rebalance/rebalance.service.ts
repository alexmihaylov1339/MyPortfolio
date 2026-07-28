import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  MarketPricesService,
  BASE_CURRENCY,
} from '../market-prices/market-prices.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { calculateRebalanceDiff } from './rebalance-diff';
import type { RebalanceComparisonResponse } from './rebalance.helpers';

@Injectable()
export class RebalanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly marketPrices: MarketPricesService,
    private readonly portfolios: PortfoliosService,
  ) {}

  async getComparisonForUser(
    userId: string,
    requestedPortfolioId?: string,
  ): Promise<RebalanceComparisonResponse> {
    const portfolioId = await this.portfolios.resolvePortfolioId(
      userId,
      requestedPortfolioId,
    );

    const defaultModel = await this.prisma.modelPortfolio.findFirst({
      where: { userId, portfolioId, isDefault: true },
      include: { allocations: true },
    });

    if (!defaultModel) {
      return {
        hasDefaultModel: false,
        baseCurrency: null,
        entries: [],
        fxUnavailable: false,
      };
    }

    const pnl = await this.marketPrices.getPortfolioPnlForUser(
      userId,
      portfolioId,
    );

    const otherCurrencies = pnl.currencies
      .map((summary) => summary.currency)
      .filter((currency) => currency !== BASE_CURRENCY);
    const rateEntries = await Promise.all(
      otherCurrencies.map(
        async (currency) =>
          [
            currency,
            await this.marketPrices.getFxRate(currency, BASE_CURRENCY),
          ] as const,
      ),
    );
    const rates = new Map(
      rateEntries.filter(
        (entry): entry is [string, Prisma.Decimal] => entry[1] !== null,
      ),
    );

    const diff = calculateRebalanceDiff(
      pnl.currencies,
      BASE_CURRENCY,
      rates,
      defaultModel.allocations,
    );

    if (!diff) {
      return {
        hasDefaultModel: true,
        modelId: defaultModel.id,
        modelName: defaultModel.name,
        baseCurrency: BASE_CURRENCY,
        entries: [],
        fxUnavailable: true,
      };
    }

    return {
      hasDefaultModel: true,
      modelId: defaultModel.id,
      modelName: defaultModel.name,
      baseCurrency: diff.baseCurrency,
      entries: diff.entries,
      fxUnavailable: false,
    };
  }
}
