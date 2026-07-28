import type { Position } from '@features/positions/services';
import type { PositionPnl } from '@features/dashboard/services';

export interface TickerDetailLot {
  positionId: string;
  broker: string;
  status: 'OPEN' | 'CLOSED';
  quantity: string;
  averageBuyPrice: string;
  /** Live price for an OPEN lot, the recorded close price for a CLOSED one. */
  price: string | null;
  value: string | null;
  pnl: string | null;
  totalDividends: string;
  openedAt: string;
  closedAt: string | null;
}

export interface TickerDetail {
  ticker: string;
  /** An exchange listing known from one of the held lots, if any — used to look up the full company name. */
  exchangeMicCode: string | null;
  currency: string;
  /** Shares actually held right now — always OPEN-only, unaffected by either toggle. */
  sharesHeld: string;
  currentPrice: string | null;
  currentValue: string | null;
  /** Weighted average buy price — OPEN-only, or OPEN+CLOSED when includeClosedPositions is on. */
  averageBuyPrice: string | null;
  totalInvested: string | null;
  /** OPEN-only, always known once priced — you can't have unrealized gain on shares you no longer hold. */
  unrealizedPnl: string | null;
  /** CLOSED-only. 0.00 when there are no closed lots at all, not null. */
  realizedPnl: string | null;
  /** Headline figure: scoped by includeClosedPositions, plus dividends when includeDividends is on. */
  totalPnl: string | null;
  totalPnlPercent: string | null;
  /** Always the sum across every lot regardless of status — dividends aren't scope-dependent. */
  totalDividends: string;
  lots: TickerDetailLot[];
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function fmt(value: number): string {
  return value.toFixed(2);
}

/**
 * Aggregates every lot of one ticker (across brokers, open and closed) into
 * a single detail view. Reuses each lot's own already-computed pnl/dividend
 * figures from the live P&L endpoint rather than re-deriving them, so this
 * can't drift from the backend's math — it only sums/re-weights.
 */
export function buildTickerDetail(
  ticker: string,
  positions: Position[],
  pnlByPositionId: Map<string, PositionPnl>,
  includeClosedPositions: boolean,
  includeDividends: boolean,
): TickerDetail | null {
  const tickerPositions = positions.filter((position) => position.ticker === ticker);
  if (tickerPositions.length === 0) {
    return null;
  }

  const lots: TickerDetailLot[] = tickerPositions
    .map((position) => {
      const pnl = pnlByPositionId.get(position.id);
      return {
        positionId: position.id,
        broker: position.broker,
        status: position.status,
        quantity: position.quantity,
        averageBuyPrice: position.averageBuyPrice,
        price: pnl?.currentPrice ?? null,
        value: pnl?.currentValue ?? null,
        pnl: pnl?.unrealizedPnl ?? null,
        totalDividends: pnl?.totalDividends ?? '0.00',
        openedAt: position.openedAt,
        closedAt: position.closedAt ?? null,
      };
    })
    .sort((a, b) => a.openedAt.localeCompare(b.openedAt));

  const openLots = lots.filter((lot) => lot.status === 'OPEN');
  const closedLots = lots.filter((lot) => lot.status === 'CLOSED');
  const scopedLots = includeClosedPositions ? lots : openLots;

  const sharesHeld = sum(openLots.map((lot) => Number(lot.quantity)));

  const openPriced = openLots.filter((lot) => lot.value !== null && lot.price !== null);
  const currentValue =
    openPriced.length > 0
      ? sum(openPriced.map((lot) => Number(lot.value)))
      : null;
  const currentPrice =
    currentValue !== null
      ? currentValue / sum(openPriced.map((lot) => Number(lot.quantity)))
      : null;

  const scopedQuantity = sum(scopedLots.map((lot) => Number(lot.quantity)));
  const scopedCost = sum(
    scopedLots.map((lot) => Number(lot.quantity) * Number(lot.averageBuyPrice)),
  );
  const averageBuyPrice = scopedQuantity > 0 ? scopedCost / scopedQuantity : null;
  const totalInvested = scopedQuantity > 0 ? scopedCost : null;

  const unrealizedPnl = openPriced.length > 0 ? sum(openPriced.map((lot) => Number(lot.pnl))) : null;

  const closedPriced = closedLots.filter((lot) => lot.pnl !== null);
  const realizedPnl =
    closedLots.length === 0
      ? 0
      : closedPriced.length > 0
        ? sum(closedPriced.map((lot) => Number(lot.pnl)))
        : null;

  const totalDividends = sum(lots.map((lot) => Number(lot.totalDividends)));

  const pnlPieces = includeClosedPositions ? [unrealizedPnl, realizedPnl] : [unrealizedPnl];
  const pnlKnown = pnlPieces.every((piece) => piece !== null);
  const basePnl = pnlKnown ? sum(pnlPieces as number[]) : null;
  const totalPnl = basePnl === null ? null : includeDividends ? basePnl + totalDividends : basePnl;

  const costBasisForPercent = includeClosedPositions ? totalInvested : scopedQuantity > 0 ? scopedCost : null;
  const totalPnlPercent =
    totalPnl !== null && costBasisForPercent && costBasisForPercent > 0
      ? (totalPnl / costBasisForPercent) * 100
      : null;

  const exchangeMicCode =
    tickerPositions.find((position) => position.exchangeMicCode)?.exchangeMicCode ?? null;

  return {
    ticker,
    exchangeMicCode,
    currency: tickerPositions[0].currency,
    sharesHeld: fmt(sharesHeld),
    currentPrice: currentPrice !== null ? fmt(currentPrice) : null,
    currentValue: currentValue !== null ? fmt(currentValue) : null,
    averageBuyPrice: averageBuyPrice !== null ? fmt(averageBuyPrice) : null,
    totalInvested: totalInvested !== null ? fmt(totalInvested) : null,
    unrealizedPnl: unrealizedPnl !== null ? fmt(unrealizedPnl) : null,
    realizedPnl: realizedPnl !== null ? fmt(realizedPnl) : null,
    totalPnl: totalPnl !== null ? fmt(totalPnl) : null,
    totalPnlPercent: totalPnlPercent !== null ? fmt(totalPnlPercent) : null,
    totalDividends: fmt(totalDividends),
    lots: scopedLots,
  };
}
