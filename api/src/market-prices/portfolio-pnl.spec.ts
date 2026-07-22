import { Broker, AssetType, PositionStatus, Prisma } from '@prisma/client';
import type { Position } from '@prisma/client';

import { calculatePortfolioPnl } from './portfolio-pnl';

function buildPosition(overrides: Partial<Position> = {}): Position {
  return {
    id: 'position-id',
    userId: 'user-id',
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

describe('calculatePortfolioPnl', () => {
  it('returns an empty currencies array for zero open positions', () => {
    const result = calculatePortfolioPnl([], new Map());

    expect(result).toEqual({ currencies: [] });
  });

  it('computes a gain when the current price exceeds the average buy price', () => {
    const position = buildPosition({
      quantity: new Prisma.Decimal('10'),
      averageBuyPrice: new Prisma.Decimal('100'),
    });
    const prices = new Map([['AAPL', new Prisma.Decimal('150')]]);

    const result = calculatePortfolioPnl([position], prices);

    expect(result.currencies).toEqual([
      {
        currency: 'USD',
        totalCurrentValue: '1500.00',
        totalUnrealizedPnl: '500.00',
        positions: [
          {
            positionId: 'position-id',
            ticker: 'AAPL',
            quantity: '10',
            averageBuyPrice: '100',
            currentPrice: '150.00',
            currentValue: '1500.00',
            unrealizedPnl: '500.00',
            unrealizedPnlPercent: '50.00',
          },
        ],
      },
    ]);
  });

  it('computes a loss when the current price is below the average buy price', () => {
    const position = buildPosition({
      ticker: 'TSLA',
      quantity: new Prisma.Decimal('5'),
      averageBuyPrice: new Prisma.Decimal('300'),
    });
    const prices = new Map([['TSLA', new Prisma.Decimal('200')]]);

    const result = calculatePortfolioPnl([position], prices);

    expect(result.currencies[0].positions[0]).toMatchObject({
      currentValue: '1000.00',
      unrealizedPnl: '-500.00',
      unrealizedPnlPercent: '-33.33',
    });
  });

  it('shows zero P&L at break-even', () => {
    const position = buildPosition({
      quantity: new Prisma.Decimal('10'),
      averageBuyPrice: new Prisma.Decimal('100'),
    });
    const prices = new Map([['AAPL', new Prisma.Decimal('100')]]);

    const result = calculatePortfolioPnl([position], prices);

    expect(result.currencies[0].positions[0]).toMatchObject({
      unrealizedPnl: '0.00',
      unrealizedPnlPercent: '0.00',
    });
  });

  it('excludes a position with no available price from totals instead of treating it as zero', () => {
    const priced = buildPosition({
      id: '1',
      ticker: 'AAPL',
      quantity: new Prisma.Decimal('10'),
      averageBuyPrice: new Prisma.Decimal('100'),
    });
    const unpriced = buildPosition({
      id: '2',
      ticker: 'MSFT',
      quantity: new Prisma.Decimal('2'),
      averageBuyPrice: new Prisma.Decimal('50'),
    });
    const prices = new Map([['AAPL', new Prisma.Decimal('150')]]);

    const result = calculatePortfolioPnl([priced, unpriced], prices);

    const [usd] = result.currencies;
    expect(usd.totalCurrentValue).toBe('1500.00');
    expect(usd.totalUnrealizedPnl).toBe('500.00');
    const msftEntry = usd.positions.find((p) => p.ticker === 'MSFT');
    expect(msftEntry).toMatchObject({
      currentPrice: null,
      currentValue: null,
      unrealizedPnl: null,
      unrealizedPnlPercent: null,
    });
  });

  it('groups by currency without blending totals', () => {
    const usdPosition = buildPosition({
      id: '1',
      currency: 'USD',
      ticker: 'AAPL',
      quantity: new Prisma.Decimal('10'),
      averageBuyPrice: new Prisma.Decimal('100'),
    });
    const eurPosition = buildPosition({
      id: '2',
      currency: 'EUR',
      ticker: 'VOO',
      quantity: new Prisma.Decimal('2'),
      averageBuyPrice: new Prisma.Decimal('400'),
    });
    const prices = new Map([
      ['AAPL', new Prisma.Decimal('150')],
      ['VOO', new Prisma.Decimal('420')],
    ]);

    const result = calculatePortfolioPnl([usdPosition, eurPosition], prices);

    expect(result.currencies.map((c) => c.currency)).toEqual(['EUR', 'USD']);
    expect(
      result.currencies.find((c) => c.currency === 'USD')?.totalCurrentValue,
    ).toBe('1500.00');
    expect(
      result.currencies.find((c) => c.currency === 'EUR')?.totalCurrentValue,
    ).toBe('840.00');
  });

  it('excludes closed positions entirely, even when a price is available', () => {
    const closedPosition = buildPosition({
      status: PositionStatus.CLOSED,
      quantity: new Prisma.Decimal('10'),
      averageBuyPrice: new Prisma.Decimal('100'),
    });
    const prices = new Map([['AAPL', new Prisma.Decimal('150')]]);

    const result = calculatePortfolioPnl([closedPosition], prices);

    expect(result.currencies).toEqual([]);
  });
});
