import { Broker, AssetType, PositionStatus, Prisma } from '@prisma/client';
import type { Position } from '@prisma/client';

import { calculatePositionsSummary } from './positions-summary';

function buildPosition(overrides: Partial<Position> = {}): Position {
  return {
    id: 'position-id',
    userId: 'user-id',
    portfolioId: 'portfolio-id',
    broker: Broker.REVOLUT,
    ticker: 'AAPL',
    name: null,
    assetType: AssetType.STOCK,
    quantity: new Prisma.Decimal('1'),
    averageBuyPrice: new Prisma.Decimal('1'),
    currency: 'USD',
    status: PositionStatus.OPEN,
    openedAt: new Date('2026-01-01'),
    closedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('calculatePositionsSummary', () => {
  it('returns an empty summary for zero positions', () => {
    const result = calculatePositionsSummary([]);

    expect(result).toEqual({
      currencies: [],
      positionCounts: { open: 0, closed: 0 },
    });
  });

  it('gives a single position 100% allocation', () => {
    const position = buildPosition({
      quantity: new Prisma.Decimal('10'),
      averageBuyPrice: new Prisma.Decimal('150'),
    });

    const result = calculatePositionsSummary([position]);

    expect(result.currencies).toEqual([
      {
        currency: 'USD',
        totalInvested: '1500.00',
        byTicker: [{ ticker: 'AAPL', invested: '1500.00', percent: '100.00' }],
        byBroker: [
          { broker: 'REVOLUT', invested: '1500.00', percent: '100.00' },
        ],
      },
    ]);
    expect(result.positionCounts).toEqual({ open: 1, closed: 0 });
  });

  it('splits allocation correctly across multiple positions in the same currency', () => {
    const positions = [
      buildPosition({
        id: '1',
        ticker: 'AAPL',
        broker: Broker.REVOLUT,
        quantity: new Prisma.Decimal('10'),
        averageBuyPrice: new Prisma.Decimal('150'),
      }),
      buildPosition({
        id: '2',
        ticker: 'MSFT',
        broker: Broker.IBKR,
        quantity: new Prisma.Decimal('5'),
        averageBuyPrice: new Prisma.Decimal('300'),
      }),
    ];

    const result = calculatePositionsSummary(positions);

    expect(result.currencies).toHaveLength(1);
    const [usd] = result.currencies;
    expect(usd.totalInvested).toBe('3000.00');
    expect(usd.byTicker).toEqual([
      { ticker: 'AAPL', invested: '1500.00', percent: '50.00' },
      { ticker: 'MSFT', invested: '1500.00', percent: '50.00' },
    ]);

    const percentSum = usd.byTicker.reduce(
      (sum, entry) => sum + Number(entry.percent),
      0,
    );
    expect(percentSum).toBeCloseTo(100, 2);
  });

  it('groups positions by currency without blending totals', () => {
    const positions = [
      buildPosition({
        id: '1',
        currency: 'USD',
        ticker: 'AAPL',
        quantity: new Prisma.Decimal('10'),
        averageBuyPrice: new Prisma.Decimal('150'),
      }),
      buildPosition({
        id: '2',
        currency: 'EUR',
        ticker: 'VOO',
        broker: Broker.IBKR,
        quantity: new Prisma.Decimal('2'),
        averageBuyPrice: new Prisma.Decimal('400'),
      }),
    ];

    const result = calculatePositionsSummary(positions);

    expect(result.currencies.map((c) => c.currency)).toEqual(['EUR', 'USD']);
    expect(
      result.currencies.find((c) => c.currency === 'USD')?.totalInvested,
    ).toBe('1500.00');
    expect(
      result.currencies.find((c) => c.currency === 'EUR')?.totalInvested,
    ).toBe('800.00');
  });

  it('excludes closed positions from totals/allocation but counts them', () => {
    const positions = [
      buildPosition({
        id: '1',
        status: PositionStatus.OPEN,
        quantity: new Prisma.Decimal('10'),
        averageBuyPrice: new Prisma.Decimal('150'),
      }),
      buildPosition({
        id: '2',
        status: PositionStatus.CLOSED,
        ticker: 'TSLA',
        quantity: new Prisma.Decimal('1'),
        averageBuyPrice: new Prisma.Decimal('200'),
      }),
    ];

    const result = calculatePositionsSummary(positions);

    expect(result.currencies).toEqual([
      {
        currency: 'USD',
        totalInvested: '1500.00',
        byTicker: [{ ticker: 'AAPL', invested: '1500.00', percent: '100.00' }],
        byBroker: [
          { broker: 'REVOLUT', invested: '1500.00', percent: '100.00' },
        ],
      },
    ]);
    expect(result.positionCounts).toEqual({ open: 1, closed: 1 });
  });

  it('preserves decimal precision for a fractional quantity instead of truncating it', () => {
    // 10.333333 * 3 = 30.999999, which rounds to 31.00. A bug that parsed
    // quantity as an integer (or lost precision through a float roundtrip)
    // would instead produce 30.00.
    const position = buildPosition({
      quantity: new Prisma.Decimal('10.333333'),
      averageBuyPrice: new Prisma.Decimal('3'),
    });

    const result = calculatePositionsSummary([position]);

    expect(result.currencies[0].totalInvested).toBe('31.00');
  });
});
