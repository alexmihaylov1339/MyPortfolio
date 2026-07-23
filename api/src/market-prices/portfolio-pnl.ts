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
