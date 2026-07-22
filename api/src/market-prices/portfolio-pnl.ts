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
}

export interface CurrencyPnlSummary {
  currency: string;
  totalCurrentValue: string;
  totalUnrealizedPnl: string;
  positions: PositionPnl[];
}

export interface PortfolioPnlResponse {
  currencies: CurrencyPnlSummary[];
}

function calculatePositionPnl(
  position: Position,
  price: Prisma.Decimal | null | undefined,
): PositionPnl {
  const base = {
    positionId: position.id,
    ticker: position.ticker,
    quantity: position.quantity.toString(),
    averageBuyPrice: position.averageBuyPrice.toString(),
  };

  if (!price) {
    return {
      ...base,
      currentPrice: null,
      currentValue: null,
      unrealizedPnl: null,
      unrealizedPnlPercent: null,
    };
  }

  const currentValue = position.quantity.times(price);
  const costBasis = position.quantity.times(position.averageBuyPrice);
  const unrealizedPnl = currentValue.minus(costBasis);
  const unrealizedPnlPercent = costBasis.isZero()
    ? new Prisma.Decimal(0)
    : unrealizedPnl.dividedBy(costBasis).times(100);

  return {
    ...base,
    currentPrice: price.toFixed(2),
    currentValue: currentValue.toFixed(2),
    unrealizedPnl: unrealizedPnl.toFixed(2),
    unrealizedPnlPercent: unrealizedPnlPercent.toFixed(2),
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

function isPriced(
  pnl: PositionPnl,
): pnl is PositionPnl & { currentValue: string; unrealizedPnl: string } {
  return pnl.currentValue !== null && pnl.unrealizedPnl !== null;
}

/**
 * Only OPEN positions are priced — closed positions have no "current"
 * value to speak of, and this app doesn't track a sale price, so realized
 * P&L can't be computed at all with the current data model.
 *
 * A position whose price is unavailable (no live fetch and no usable
 * cache) is excluded from its currency's totals, not treated as zero —
 * silently zeroing a real holding would misreport the portfolio's value.
 */
export function calculatePortfolioPnl(
  positions: Position[],
  prices: Map<string, Prisma.Decimal | null>,
): PortfolioPnlResponse {
  const openPositions = positions.filter(
    (position) => position.status === PositionStatus.OPEN,
  );
  const byCurrency = groupPositionsByCurrency(openPositions);

  const currencies = Array.from(byCurrency.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, currencyPositions]) => {
      const positionPnls = currencyPositions.map((position) =>
        calculatePositionPnl(position, prices.get(position.ticker)),
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

      return {
        currency,
        totalCurrentValue: totalCurrentValue.toFixed(2),
        totalUnrealizedPnl: totalUnrealizedPnl.toFixed(2),
        positions: positionPnls,
      };
    });

  return { currencies };
}
