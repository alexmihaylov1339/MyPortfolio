import { Prisma, PositionStatus } from '@prisma/client';
import type { Position } from '@prisma/client';

export interface PositionPnl {
  positionId: string;
  ticker: string;
  status: 'OPEN' | 'CLOSED';
  quantity: string;
  averageBuyPrice: string;
  /** Live market price for an OPEN position, the recorded closePrice for a CLOSED one. */
  currentPrice: string | null;
  currentValue: string | null;
  /** Unrealized P&L for OPEN positions, realized P&L (vs. closePrice) for CLOSED ones — see `status`. */
  unrealizedPnl: string | null;
  unrealizedPnlPercent: string | null;
  /** Sum of dividends ever recorded for this position — always known, independent of pricing. */
  totalDividends: string;
  /** unrealizedPnl + totalDividends. Null whenever unrealizedPnl is null (no price to base a total on). */
  totalReturnPnl: string | null;
  totalReturnPnlPercent: string | null;
}

export interface CurrencyPnlSummary {
  currency: string;
  /** What you currently own is worth — OPEN positions only, closed ones aren't held anymore. */
  totalCurrentValue: string;
  /** OPEN positions only, price-based, no dividends — unchanged scope from before closed-position support. */
  totalUnrealizedPnl: string;
  /** Every position regardless of status — dividends aren't price- or status-dependent. */
  totalDividends: string;
  /** OPEN positions only: totalUnrealizedPnl + their own dividends. */
  totalReturnPnl: string;
  /** OPEN (unrealized) + CLOSED (realized, via closePrice) positions combined, no dividends. */
  totalPnlAllPositions: string;
  /** Same as totalPnlAllPositions, plus dividends from every position (open and closed). */
  totalReturnPnlAllPositions: string;
  positions: PositionPnl[];
}

export interface CombinedPnlTotal {
  /** The base currency every figure below has been converted into. */
  currency: string;
  totalCurrentValue: string;
  totalUnrealizedPnl: string;
  totalDividends: string;
  totalReturnPnl: string;
  totalPnlAllPositions: string;
  totalReturnPnlAllPositions: string;
  /** FX rate used to convert 1 unit of each non-base currency into the base, e.g. { "USD": "0.8792" }. */
  rates: Record<string, string>;
}

export interface PortfolioPnlResponse {
  currencies: CurrencyPnlSummary[];
}

function calculatePositionPnl(
  position: Position,
  price: Prisma.Decimal | null | undefined,
  dividendTotal: Prisma.Decimal | undefined,
): PositionPnl {
  const totalDividends = dividendTotal ?? new Prisma.Decimal(0);

  const base = {
    positionId: position.id,
    ticker: position.ticker,
    status: position.status,
    quantity: position.quantity.toString(),
    averageBuyPrice: position.averageBuyPrice.toString(),
    totalDividends: totalDividends.toFixed(2),
  };

  if (!price) {
    return {
      ...base,
      currentPrice: null,
      currentValue: null,
      unrealizedPnl: null,
      unrealizedPnlPercent: null,
      totalReturnPnl: null,
      totalReturnPnlPercent: null,
    };
  }

  const currentValue = position.quantity.times(price);
  const costBasis = position.quantity.times(position.averageBuyPrice);
  const unrealizedPnl = currentValue.minus(costBasis);
  const unrealizedPnlPercent = costBasis.isZero()
    ? new Prisma.Decimal(0)
    : unrealizedPnl.dividedBy(costBasis).times(100);

  const totalReturnPnl = unrealizedPnl.plus(totalDividends);
  const totalReturnPnlPercent = costBasis.isZero()
    ? new Prisma.Decimal(0)
    : totalReturnPnl.dividedBy(costBasis).times(100);

  return {
    ...base,
    currentPrice: price.toFixed(2),
    currentValue: currentValue.toFixed(2),
    unrealizedPnl: unrealizedPnl.toFixed(2),
    unrealizedPnlPercent: unrealizedPnlPercent.toFixed(2),
    totalReturnPnl: totalReturnPnl.toFixed(2),
    totalReturnPnlPercent: totalReturnPnlPercent.toFixed(2),
  };
}

function groupPositionsByCurrency(
  positions: Position[],
): Map<string, Position[]> {
  const grouped = new Map<string, Position[]>();

  for (const position of positions) {
    const existing = grouped.get(position.currency) ?? [];
    existing.push(position);
    grouped.set(position.currency, existing);
  }

  return grouped;
}

function isPriced(pnl: PositionPnl): pnl is PositionPnl & {
  currentValue: string;
  unrealizedPnl: string;
  totalReturnPnl: string;
} {
  return (
    pnl.currentValue !== null &&
    pnl.unrealizedPnl !== null &&
    pnl.totalReturnPnl !== null
  );
}

function sumField(
  pnls: (PositionPnl & {
    currentValue: string;
    unrealizedPnl: string;
    totalReturnPnl: string;
  })[],
  field: 'currentValue' | 'unrealizedPnl' | 'totalReturnPnl',
): Prisma.Decimal {
  return pnls.reduce(
    (sum, pnl) => sum.plus(new Prisma.Decimal(pnl[field])),
    new Prisma.Decimal(0),
  );
}

/**
 * Both OPEN and CLOSED positions are included. An OPEN position is priced
 * from the live `prices` map; a CLOSED one is priced from its own recorded
 * `closePrice` (this app doesn't track a sale price for positions closed
 * before that field existed, so those show as price-unavailable rather
 * than a guessed figure — same "never fake it" rule as everywhere else).
 *
 * totalCurrentValue/totalUnrealizedPnl/totalReturnPnl stay OPEN-only (your
 * current portfolio value and its P&L, unchanged scope from before closed
 * positions were supported). totalPnlAllPositions/totalReturnPnlAllPositions
 * add CLOSED positions' realized P&L on top, for a caller that wants a
 * combined "how have I done overall, including what I've already sold"
 * figure — the frontend's "include closed positions" toggle switches
 * between these two total pairs, and between showing CLOSED positions in
 * the per-currency `positions` list at all.
 *
 * dividendTotals is keyed by positionId (not ticker) since dividends are
 * recorded per-position, and totalDividends always sums every position
 * regardless of status or pricing — dividends are neither.
 */
export function calculatePortfolioPnl(
  positions: Position[],
  prices: Map<string, Prisma.Decimal | null>,
  dividendTotals: Map<string, Prisma.Decimal> = new Map(),
): PortfolioPnlResponse {
  const byCurrency = groupPositionsByCurrency(positions);

  const currencies = Array.from(byCurrency.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, currencyPositions]) => {
      const positionPnls = currencyPositions.map((position) =>
        calculatePositionPnl(
          position,
          position.status === PositionStatus.OPEN
            ? prices.get(position.ticker)
            : position.closePrice,
          dividendTotals.get(position.id),
        ),
      );

      const openPriced = positionPnls.filter(
        (pnl) => pnl.status === 'OPEN' && isPriced(pnl),
      ) as (PositionPnl & {
        currentValue: string;
        unrealizedPnl: string;
        totalReturnPnl: string;
      })[];
      const allPriced = positionPnls.filter(isPriced);

      const totalDividends = positionPnls.reduce(
        (sum, pnl) => sum.plus(new Prisma.Decimal(pnl.totalDividends)),
        new Prisma.Decimal(0),
      );

      return {
        currency,
        totalCurrentValue: sumField(openPriced, 'currentValue').toFixed(2),
        totalUnrealizedPnl: sumField(openPriced, 'unrealizedPnl').toFixed(2),
        totalDividends: totalDividends.toFixed(2),
        totalReturnPnl: sumField(openPriced, 'totalReturnPnl').toFixed(2),
        totalPnlAllPositions: sumField(allPriced, 'unrealizedPnl').toFixed(2),
        totalReturnPnlAllPositions: sumField(
          allPriced,
          'totalReturnPnl',
        ).toFixed(2),
        positions: positionPnls,
      };
    });

  return { currencies };
}

const COMBINABLE_FIELDS = [
  'totalCurrentValue',
  'totalUnrealizedPnl',
  'totalDividends',
  'totalReturnPnl',
  'totalPnlAllPositions',
  'totalReturnPnlAllPositions',
] as const;

/**
 * Converts every currency's totals into one base currency and sums them,
 * so a portfolio split across e.g. EUR and USD can show a single "my
 * total" figure. Requires a live FX rate for every non-base currency
 * actually held — if even one is missing, returns null rather than a
 * partial or silently-wrong total ("never fake it", same rule as an
 * unpriced position).
 */
export function combineCurrencyTotals(
  currencies: CurrencyPnlSummary[],
  baseCurrency: string,
  rates: Map<string, Prisma.Decimal>,
): CombinedPnlTotal | null {
  if (currencies.length === 0) {
    return null;
  }

  const totals = Object.fromEntries(
    COMBINABLE_FIELDS.map((field) => [field, new Prisma.Decimal(0)]),
  ) as Record<(typeof COMBINABLE_FIELDS)[number], Prisma.Decimal>;
  const usedRates: Record<string, string> = {};

  for (const summary of currencies) {
    const rate =
      summary.currency === baseCurrency
        ? new Prisma.Decimal(1)
        : rates.get(summary.currency);

    if (!rate) {
      return null;
    }

    if (summary.currency !== baseCurrency) {
      usedRates[summary.currency] = rate.toString();
    }

    for (const field of COMBINABLE_FIELDS) {
      totals[field] = totals[field].plus(
        new Prisma.Decimal(summary[field]).times(rate),
      );
    }
  }

  return {
    currency: baseCurrency,
    totalCurrentValue: totals.totalCurrentValue.toFixed(2),
    totalUnrealizedPnl: totals.totalUnrealizedPnl.toFixed(2),
    totalDividends: totals.totalDividends.toFixed(2),
    totalReturnPnl: totals.totalReturnPnl.toFixed(2),
    totalPnlAllPositions: totals.totalPnlAllPositions.toFixed(2),
    totalReturnPnlAllPositions: totals.totalReturnPnlAllPositions.toFixed(2),
    rates: usedRates,
  };
}
