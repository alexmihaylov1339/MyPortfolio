import { Prisma, PositionStatus } from '@prisma/client';
import type { Position } from '@prisma/client';

export interface TickerAllocationEntry {
  ticker: string;
  invested: string;
  percent: string;
}

export interface BrokerAllocationEntry {
  broker: string;
  invested: string;
  percent: string;
}

export interface CurrencySummary {
  currency: string;
  totalInvested: string;
  byTicker: TickerAllocationEntry[];
  byBroker: BrokerAllocationEntry[];
}

export interface PositionsSummaryResponse {
  currencies: CurrencySummary[];
  positionCounts: { open: number; closed: number };
}

function sumDecimals(values: Prisma.Decimal[]): Prisma.Decimal {
  return values.reduce(
    (total, value) => total.plus(value),
    new Prisma.Decimal(0),
  );
}

function calculatePercent(part: Prisma.Decimal, total: Prisma.Decimal): string {
  if (total.isZero()) {
    return '0.00';
  }

  return part.dividedBy(total).times(100).toFixed(2);
}

function sumInvestedByKey(
  entries: Array<{ key: string; invested: Prisma.Decimal }>,
): Map<string, Prisma.Decimal> {
  const grouped = new Map<string, Prisma.Decimal>();

  for (const entry of entries) {
    const current = grouped.get(entry.key) ?? new Prisma.Decimal(0);
    grouped.set(entry.key, current.plus(entry.invested));
  }

  return grouped;
}

function toSortedAllocationEntries(
  grouped: Map<string, Prisma.Decimal>,
  total: Prisma.Decimal,
): Array<{ key: string; invested: string; percent: string }> {
  return Array.from(grouped.entries())
    .sort(([, a], [, b]) => b.comparedTo(a))
    .map(([key, invested]) => ({
      key,
      invested: invested.toFixed(2),
      percent: calculatePercent(invested, total),
    }));
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

function buildCurrencySummary(
  currency: string,
  currencyPositions: Position[],
): CurrencySummary {
  const invested = currencyPositions.map((position) => ({
    ticker: position.ticker,
    broker: position.broker,
    invested: position.quantity.times(position.averageBuyPrice),
  }));

  const totalInvested = sumDecimals(invested.map((entry) => entry.invested));

  const byTicker = toSortedAllocationEntries(
    sumInvestedByKey(invested.map((e) => ({ key: e.ticker, invested: e.invested }))),
    totalInvested,
  ).map(({ key, invested: entryInvested, percent }) => ({
    ticker: key,
    invested: entryInvested,
    percent,
  }));

  const byBroker = toSortedAllocationEntries(
    sumInvestedByKey(invested.map((e) => ({ key: e.broker, invested: e.invested }))),
    totalInvested,
  ).map(({ key, invested: entryInvested, percent }) => ({
    broker: key,
    invested: entryInvested,
    percent,
  }));

  return {
    currency,
    totalInvested: totalInvested.toFixed(2),
    byTicker,
    byBroker,
  };
}

/**
 * Currency groups are never blended into one total — summing different
 * currencies without a real exchange rate would silently misreport the
 * user's money. Real conversion is deferred until Step 6 has live rates.
 */
export function calculatePositionsSummary(
  positions: Position[],
): PositionsSummaryResponse {
  const positionCounts = {
    open: positions.filter((p) => p.status === PositionStatus.OPEN).length,
    closed: positions.filter((p) => p.status === PositionStatus.CLOSED).length,
  };

  const openPositions = positions.filter(
    (p) => p.status === PositionStatus.OPEN,
  );
  const byCurrency = groupPositionsByCurrency(openPositions);

  const currencies = Array.from(byCurrency.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, currencyPositions]) =>
      buildCurrencySummary(currency, currencyPositions),
    );

  return { currencies, positionCounts };
}
