import { Prisma, PositionStatus } from '@prisma/client';
import type { ModelAllocation } from '@prisma/client';

import type { CurrencyPnlSummary } from '../market-prices/portfolio-pnl';

export type RebalanceStatus =
  'OVERWEIGHT' | 'UNDERWEIGHT' | 'ON_TARGET' | 'PRICE_UNAVAILABLE';

export interface RebalanceEntry {
  ticker: string;
  /** The model allocation's exchange listing, when this ticker comes from (or matches) a model target — null for held-only tickers not in the model. */
  exchangeMicCode: string | null;
  actualPercent: string | null;
  targetPercent: string;
  differencePercent: string | null;
  /** Current live value held in this ticker, converted to the base currency. Null when unpriced. */
  actualValue: string | null;
  /** What actualValue would need to be to sit exactly at target — always computable once the total is. */
  targetValue: string;
  /** targetValue - actualValue: positive means buy this much more, negative means sell this much. Null when actualValue is unknown. */
  differenceValue: string | null;
  status: RebalanceStatus;
}

export interface RebalanceComparisonInput {
  baseCurrency: string;
  entries: RebalanceEntry[];
}

function resolveStatus(difference: Prisma.Decimal): RebalanceStatus {
  if (difference.isZero()) {
    return 'ON_TARGET';
  }

  return difference.isPositive() ? 'OVERWEIGHT' : 'UNDERWEIGHT';
}

/**
 * Sums each OPEN position's live currentValue into its ticker, converting
 * every non-base currency via the supplied rates. A ticker with even one
 * unpriced lot is marked null rather than guessed — "never fake it", same
 * rule as everywhere else pricing shows up in this app. Returns null
 * outright if a currency actually held has no rate at all, since every
 * total downstream would otherwise be silently wrong.
 */
function aggregateActualValueByTicker(
  currencies: CurrencyPnlSummary[],
  baseCurrency: string,
  rates: Map<string, Prisma.Decimal>,
): {
  totalCurrentValue: Prisma.Decimal;
  byTicker: Map<string, Prisma.Decimal | null>;
} | null {
  const byTicker = new Map<string, Prisma.Decimal | null>();

  for (const currencySummary of currencies) {
    const rate =
      currencySummary.currency === baseCurrency
        ? new Prisma.Decimal(1)
        : rates.get(currencySummary.currency);

    if (!rate) {
      return null;
    }

    for (const position of currencySummary.positions) {
      if (position.status !== PositionStatus.OPEN) {
        continue;
      }

      const existing = byTicker.has(position.ticker)
        ? byTicker.get(position.ticker)!
        : new Prisma.Decimal(0);

      if (existing === null || position.currentValue === null) {
        byTicker.set(position.ticker, null);
        continue;
      }

      const convertedValue = new Prisma.Decimal(position.currentValue).times(
        rate,
      );
      byTicker.set(position.ticker, existing.plus(convertedValue));
    }
  }

  const totalCurrentValue = Array.from(
    byTicker.values(),
  ).reduce<Prisma.Decimal>(
    (sum, value) => (value ? sum.plus(value) : sum),
    new Prisma.Decimal(0),
  );

  return { totalCurrentValue, byTicker };
}

/**
 * Compares live current allocation (across every currency you hold
 * positions in, converted to one base currency) against a model's target
 * allocation. Unlike the old cost-basis version, this reflects what
 * rebalancing actually needs: today's market weights, not what you
 * originally paid.
 */
export function calculateRebalanceDiff(
  currencies: CurrencyPnlSummary[],
  baseCurrency: string,
  rates: Map<string, Prisma.Decimal>,
  allocations: Pick<
    ModelAllocation,
    'ticker' | 'targetPercent' | 'exchangeMicCode'
  >[],
): RebalanceComparisonInput | null {
  const aggregated = aggregateActualValueByTicker(
    currencies,
    baseCurrency,
    rates,
  );
  if (!aggregated) {
    return null;
  }

  const { totalCurrentValue, byTicker: actualValueByTicker } = aggregated;

  const targetByTicker = new Map<string, Prisma.Decimal>(
    allocations.map((allocation) => [
      allocation.ticker,
      new Prisma.Decimal(allocation.targetPercent),
    ]),
  );
  const micCodeByTicker = new Map<string, string | null>(
    allocations.map((allocation) => [
      allocation.ticker,
      allocation.exchangeMicCode,
    ]),
  );

  const allTickers = new Set([
    ...actualValueByTicker.keys(),
    ...targetByTicker.keys(),
  ]);

  const entries = Array.from(allTickers)
    .sort((a, b) => a.localeCompare(b))
    .map((ticker) => {
      const exchangeMicCode = micCodeByTicker.get(ticker) ?? null;
      const target = targetByTicker.get(ticker) ?? new Prisma.Decimal(0);
      const targetValue = totalCurrentValue.isZero()
        ? new Prisma.Decimal(0)
        : totalCurrentValue.times(target).dividedBy(100);

      const rawActualValue = actualValueByTicker.get(ticker);
      const actualValue =
        rawActualValue === undefined ? new Prisma.Decimal(0) : rawActualValue;

      if (actualValue === null) {
        return {
          ticker,
          exchangeMicCode,
          actualPercent: null,
          targetPercent: target.toFixed(2),
          differencePercent: null,
          actualValue: null,
          targetValue: targetValue.toFixed(2),
          differenceValue: null,
          status: 'PRICE_UNAVAILABLE' as const,
        };
      }

      const actualPercent = totalCurrentValue.isZero()
        ? new Prisma.Decimal(0)
        : actualValue.dividedBy(totalCurrentValue).times(100);
      const differencePercent = actualPercent.minus(target);
      const differenceValue = targetValue.minus(actualValue);

      return {
        ticker,
        exchangeMicCode,
        actualPercent: actualPercent.toFixed(2),
        targetPercent: target.toFixed(2),
        differencePercent: differencePercent.toFixed(2),
        actualValue: actualValue.toFixed(2),
        targetValue: targetValue.toFixed(2),
        differenceValue: differenceValue.toFixed(2),
        status: resolveStatus(differencePercent),
      };
    });

  return { baseCurrency, entries };
}
