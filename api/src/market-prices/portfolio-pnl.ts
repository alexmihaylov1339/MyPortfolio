import { Prisma, PositionStatus } from '@prisma/client';
import type { Position } from '@prisma/client';

export interface PositionPnl {
  positionId: string;
  ticker: string;
  quantity: string;
  averageBuyPrice: string;
  currentPrice: string | null;
  currentValue: string | null;
  unrealizedPnl: string | null;
  unrealizedPnlPercent: string | null;
  /** Sum of dividends ever recorded for this position — always known, independent of pricing. */
  totalDividends: string;
  /** unrealizedPnl + totalDividends. Null whenever unrealizedPnl is null (no current price to base a total on). */
  totalReturnPnl: string | null;
  totalReturnPnlPercent: string | null;
}

export interface CurrencyPnlSummary {
  currency: string;
  totalCurrentValue: string;
  totalUnrealizedPnl: string;
  totalDividends: string;
  totalReturnPnl: string;
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

/**
 * Only OPEN positions are priced — closed positions have no "current"
 * value to speak of, and this app doesn't track a sale price, so realized
 * P&L can't be computed at all with the current data model.
 *
 * A position whose price is unavailable (no live fetch and no usable
 * cache) is excluded from its currency's totals, not treated as zero —
 * silently zeroing a real holding would misreport the portfolio's value.
 *
 * dividendTotals is keyed by positionId (not ticker) since dividends are
 * recorded per-position, and is independent of pricing — a position with
 * an unavailable price still shows its dividends total, just not a
 * combined totalReturnPnl dollar figure (that requires knowing current
 * value, so it's null under the same "never fake it" rule as unrealizedPnl).
 */
export function calculatePortfolioPnl(
  positions: Position[],
  prices: Map<string, Prisma.Decimal | null>,
  dividendTotals: Map<string, Prisma.Decimal> = new Map(),
): PortfolioPnlResponse {
  const openPositions = positions.filter(
    (position) => position.status === PositionStatus.OPEN,
  );
  const byCurrency = groupPositionsByCurrency(openPositions);

  const currencies = Array.from(byCurrency.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, currencyPositions]) => {
      const positionPnls = currencyPositions.map((position) =>
        calculatePositionPnl(
          position,
          prices.get(position.ticker),
          dividendTotals.get(position.id),
        ),
      );

      const pricedPnls = positionPnls.filter(isPriced);

      const totalCurrentValue = pricedPnls.reduce(
        (sum, pnl) => sum.plus(new Prisma.Decimal(pnl.currentValue)),
        new Prisma.Decimal(0),
      );
      const totalUnrealizedPnl = pricedPnls.reduce(
        (sum, pnl) => sum.plus(new Prisma.Decimal(pnl.unrealizedPnl)),
        new Prisma.Decimal(0),
      );
      const totalReturnPnl = pricedPnls.reduce(
        (sum, pnl) => sum.plus(new Prisma.Decimal(pnl.totalReturnPnl)),
        new Prisma.Decimal(0),
      );
      // Dividends are known independent of pricing, so this sums every
      // position in the currency group, not just the priced ones.
      const totalDividends = positionPnls.reduce(
        (sum, pnl) => sum.plus(new Prisma.Decimal(pnl.totalDividends)),
        new Prisma.Decimal(0),
      );

      return {
        currency,
        totalCurrentValue: totalCurrentValue.toFixed(2),
        totalUnrealizedPnl: totalUnrealizedPnl.toFixed(2),
        totalDividends: totalDividends.toFixed(2),
        totalReturnPnl: totalReturnPnl.toFixed(2),
        positions: positionPnls,
      };
    });

  return { currencies };
}
