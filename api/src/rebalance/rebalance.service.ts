import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  calculatePositionsSummary,
  type CurrencySummary,
} from '../positions/positions-summary';
import { calculateRebalanceDiff } from './rebalance-diff';
import type { RebalanceComparisonResponse } from './rebalance.helpers';

@Injectable()
export class RebalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getComparisonForUser(
    userId: string,
  ): Promise<RebalanceComparisonResponse> {
    const defaultModel = await this.prisma.modelPortfolio.findFirst({
      where: { userId, isDefault: true },
      include: { allocations: true },
    });

    if (!defaultModel) {
      return {
        hasDefaultModel: false,
        currency: null,
        entries: [],
        excludedCurrencies: [],
      };
    }

    const positions = await this.prisma.position.findMany({
      where: { userId },
    });
    const summary = calculatePositionsSummary(positions);
    const largestCurrency = this.findLargestCurrency(summary.currencies);
    const excludedCurrencies = summary.currencies
      .filter((currency) => currency.currency !== largestCurrency?.currency)
      .map((currency) => currency.currency);

    const diff = calculateRebalanceDiff(
      largestCurrency,
      defaultModel.allocations,
    );

    return {
      hasDefaultModel: true,
      modelId: defaultModel.id,
      modelName: defaultModel.name,
      currency: diff.currency,
      entries: diff.entries,
      excludedCurrencies,
    };
  }

  private findLargestCurrency(
    currencies: CurrencySummary[],
  ): CurrencySummary | null {
    return currencies.reduce<CurrencySummary | null>((largest, current) => {
      if (!largest) {
        return current;
      }

      const currentTotal = new Prisma.Decimal(current.totalInvested);
      const largestTotal = new Prisma.Decimal(largest.totalInvested);
      return currentTotal.greaterThan(largestTotal) ? current : largest;
    }, null);
  }
}
