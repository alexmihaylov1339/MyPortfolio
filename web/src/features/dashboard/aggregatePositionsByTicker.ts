import type { PositionPnl } from './services';

export interface AggregatedPositionPnl {
  ticker: string;
  status: 'OPEN' | 'CLOSED';
  quantity: string;
  /** Value-weighted average across priced lots (== the live price when every lot shares one), null when no lot is priced. */
  currentPrice: string | null;
  currentValue: string | null;
  unrealizedPnl: string | null;
  unrealizedPnlPercent: string | null;
  /** Sum across every lot, priced or not — dividends don't depend on pricing. */
  totalDividends: string;
  totalReturnPnl: string | null;
  totalReturnPnlPercent: string | null;
  /** How many separate positions (e.g. different brokers) were combined into this row. */
  lotCount: number;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Same ticker held across multiple positions (e.g. AAPL via two different
 * brokers) previously showed as separate P&L rows, inconsistent with the
 * cost-basis card above it, which already merges "by ticker". Merges
 * OPEN and CLOSED lots separately — combining an open holding with an
 * already-sold one under one row would blend two different things.
 *
 * Reuses each lot's own already-computed totalReturnPnl (unrealized +
 * that lot's dividends) rather than re-deriving it, so this can't drift
 * from the backend's per-position math — it only sums/re-percents.
 */
export function aggregatePositionsByTicker(
  positions: PositionPnl[],
): AggregatedPositionPnl[] {
  const groups = new Map<string, PositionPnl[]>();
  for (const position of positions) {
    const key = `${position.ticker}::${position.status}`;
    const lots = groups.get(key) ?? [];
    lots.push(position);
    groups.set(key, lots);
  }

  return Array.from(groups.values()).map((lots) => {
    const { ticker, status } = lots[0];
    const totalQuantity = sum(lots.map((lot) => Number(lot.quantity)));
    const totalDividends = sum(lots.map((lot) => Number(lot.totalDividends)));

    const pricedLots = lots.filter(
      (lot): lot is PositionPnl & { currentValue: string; unrealizedPnl: string; totalReturnPnl: string } =>
        lot.currentValue !== null && lot.unrealizedPnl !== null && lot.totalReturnPnl !== null,
    );

    if (pricedLots.length === 0) {
      return {
        ticker,
        status,
        quantity: totalQuantity.toString(),
        currentPrice: null,
        currentValue: null,
        unrealizedPnl: null,
        unrealizedPnlPercent: null,
        totalDividends: totalDividends.toFixed(2),
        totalReturnPnl: null,
        totalReturnPnlPercent: null,
        lotCount: lots.length,
      };
    }

    const pricedQuantity = sum(pricedLots.map((lot) => Number(lot.quantity)));
    const totalCurrentValue = sum(pricedLots.map((lot) => Number(lot.currentValue)));
    const totalCostBasis = sum(
      pricedLots.map((lot) => Number(lot.quantity) * Number(lot.averageBuyPrice)),
    );
    const totalUnrealizedPnl = sum(pricedLots.map((lot) => Number(lot.unrealizedPnl)));
    const totalReturnPnl = sum(pricedLots.map((lot) => Number(lot.totalReturnPnl)));

    return {
      ticker,
      status,
      quantity: totalQuantity.toString(),
      currentPrice: pricedQuantity === 0 ? null : (totalCurrentValue / pricedQuantity).toFixed(2),
      currentValue: totalCurrentValue.toFixed(2),
      unrealizedPnl: totalUnrealizedPnl.toFixed(2),
      unrealizedPnlPercent:
        totalCostBasis === 0 ? '0.00' : ((totalUnrealizedPnl / totalCostBasis) * 100).toFixed(2),
      totalDividends: totalDividends.toFixed(2),
      totalReturnPnl: totalReturnPnl.toFixed(2),
      totalReturnPnlPercent:
        totalCostBasis === 0 ? '0.00' : ((totalReturnPnl / totalCostBasis) * 100).toFixed(2),
      lotCount: lots.length,
    };
  });
}
