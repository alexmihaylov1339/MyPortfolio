import { Prisma } from '@prisma/client';
import type { ModelAllocation } from '@prisma/client';

import type { CurrencySummary } from '../positions/positions-summary';

export type RebalanceStatus = 'OVERWEIGHT' | 'UNDERWEIGHT' | 'ON_TARGET';

export interface RebalanceEntry {
  ticker: string;
  actualPercent: string;
  targetPercent: string;
  differencePercent: string;
  status: RebalanceStatus;
}

export interface RebalanceComparisonInput {
  currency: string | null;
  entries: RebalanceEntry[];
}

function resolveStatus(difference: Prisma.Decimal): RebalanceStatus {
  if (difference.isZero()) {
    return 'ON_TARGET';
  }

  return difference.isPositive() ? 'OVERWEIGHT' : 'UNDERWEIGHT';
}

/**
 * Compares real allocation (a single currency group from
 * calculatePositionsSummary — never blended across currencies) against a
 * model's target allocation. Reuses the already-computed real percentages
 * rather than recalculating them from positions.
 */
export function calculateRebalanceDiff(
  currencySummary: CurrencySummary | null,
  allocations: Pick<ModelAllocation, 'ticker' | 'targetPercent'>[],
): RebalanceComparisonInput {
  const actualByTicker = new Map<string, Prisma.Decimal>(
    (currencySummary?.byTicker ?? []).map((entry) => [
      entry.ticker,
      new Prisma.Decimal(entry.percent),
    ]),
  );
  const targetByTicker = new Map<string, Prisma.Decimal>(
    allocations.map((allocation) => [
      allocation.ticker,
      new Prisma.Decimal(allocation.targetPercent),
    ]),
  );

  const allTickers = new Set([
    ...actualByTicker.keys(),
    ...targetByTicker.keys(),
  ]);

  const entries = Array.from(allTickers)
    .sort((a, b) => a.localeCompare(b))
    .map((ticker) => {
      const actual = actualByTicker.get(ticker) ?? new Prisma.Decimal(0);
      const target = targetByTicker.get(ticker) ?? new Prisma.Decimal(0);
      const difference = actual.minus(target);

      return {
        ticker,
        actualPercent: actual.toFixed(2),
        targetPercent: target.toFixed(2),
        differencePercent: difference.toFixed(2),
        status: resolveStatus(difference),
      };
    });

  return {
    currency: currencySummary?.currency ?? null,
    entries,
  };
}
