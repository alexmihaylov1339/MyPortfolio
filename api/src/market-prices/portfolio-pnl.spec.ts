import { Broker, AssetType, PositionStatus, Prisma } from '@prisma/client';
import type { Position } from '@prisma/client';

import {
  calculatePortfolioPnl,
  combineCurrencyTotals,
  type CurrencyPnlSummary,
} from './portfolio-pnl';

function buildPosition(overrides: Partial<Position> = {}): Position {
  return {
    id: 'position-id',
    userId: 'user-id',
    portfolioId: 'portfolio-id',
    broker: Broker.REVOLUT,
    ticker: 'AAPL',
    exchangeMicCode: null,
    name: null,
    assetType: AssetType.STOCK,
    quantity: new Prisma.Decimal('1'),
    averageBuyPrice: new Prisma.Decimal('1'),
    currency: 'USD',
    status: PositionStatus.OPEN,
    openedAt: new Date('2026-01-01'),
    closedAt: null,
    closePrice: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('calculatePortfolioPnl', () => {
  it('returns an empty currencies array for zero positions', () => {
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
        totalDividends: '0.00',
        totalReturnPnl: '500.00',
        totalPnlAllPositions: '500.00',
        totalReturnPnlAllPositions: '500.00',
        positions: [
          {
            positionId: 'position-id',
            ticker: 'AAPL',
            status: 'OPEN',
            quantity: '10',
            averageBuyPrice: '100',
            currentPrice: '150.00',
            currentValue: '1500.00',
            unrealizedPnl: '500.00',
            unrealizedPnlPercent: '50.00',
            totalDividends: '0.00',
            totalReturnPnl: '500.00',
            totalReturnPnlPercent: '50.00',
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
      totalReturnPnl: '-500.00',
      totalReturnPnlPercent: '-33.33',
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
      totalReturnPnl: '0.00',
      totalReturnPnlPercent: '0.00',
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
      totalReturnPnl: null,
      totalReturnPnlPercent: null,
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

  describe('dividends (total return)', () => {
    it('adds dividends on top of unrealized P&L when a price is available', () => {
      const position = buildPosition({
        quantity: new Prisma.Decimal('10'),
        averageBuyPrice: new Prisma.Decimal('100'),
      });
      const prices = new Map([['AAPL', new Prisma.Decimal('150')]]);
      const dividendTotals = new Map([
        ['position-id', new Prisma.Decimal('25')],
      ]);

      const result = calculatePortfolioPnl([position], prices, dividendTotals);

      expect(result.currencies[0].positions[0]).toMatchObject({
        unrealizedPnl: '500.00',
        totalDividends: '25.00',
        // (500 unrealized + 25 dividends) = 525, on a 1000 cost basis = 52.5%
        totalReturnPnl: '525.00',
        totalReturnPnlPercent: '52.50',
      });
    });

    it('still reports totalDividends when the price is unavailable, but totalReturnPnl stays null', () => {
      const position = buildPosition();
      const dividendTotals = new Map([
        ['position-id', new Prisma.Decimal('25')],
      ]);

      const result = calculatePortfolioPnl(
        [position],
        new Map(),
        dividendTotals,
      );

      expect(result.currencies[0].positions[0]).toMatchObject({
        currentPrice: null,
        unrealizedPnl: null,
        totalDividends: '25.00',
        totalReturnPnl: null,
        totalReturnPnlPercent: null,
      });
    });

    it('defaults totalDividends to zero for a position with no recorded dividends', () => {
      const position = buildPosition();
      const prices = new Map([['AAPL', new Prisma.Decimal('1')]]);

      const result = calculatePortfolioPnl([position], prices);

      expect(result.currencies[0].positions[0].totalDividends).toBe('0.00');
    });

    it('sums the currency-level totalDividends across every position, priced or not', () => {
      const priced = buildPosition({
        id: '1',
        ticker: 'AAPL',
        quantity: new Prisma.Decimal('1'),
        averageBuyPrice: new Prisma.Decimal('1'),
      });
      const unpriced = buildPosition({
        id: '2',
        ticker: 'MSFT',
        quantity: new Prisma.Decimal('1'),
        averageBuyPrice: new Prisma.Decimal('1'),
      });
      const prices = new Map([['AAPL', new Prisma.Decimal('1')]]);
      const dividendTotals = new Map([
        ['1', new Prisma.Decimal('10')],
        ['2', new Prisma.Decimal('5')],
      ]);

      const result = calculatePortfolioPnl(
        [priced, unpriced],
        prices,
        dividendTotals,
      );

      expect(result.currencies[0].totalDividends).toBe('15.00');
    });

    it('sums the currency-level totalReturnPnl over priced positions only', () => {
      const priced = buildPosition({
        id: '1',
        ticker: 'AAPL',
        quantity: new Prisma.Decimal('10'),
        averageBuyPrice: new Prisma.Decimal('100'),
      });
      const unpriced = buildPosition({
        id: '2',
        ticker: 'MSFT',
        quantity: new Prisma.Decimal('1'),
        averageBuyPrice: new Prisma.Decimal('1'),
      });
      const prices = new Map([['AAPL', new Prisma.Decimal('150')]]);
      const dividendTotals = new Map([
        ['1', new Prisma.Decimal('20')],
        ['2', new Prisma.Decimal('5')],
      ]);

      const result = calculatePortfolioPnl(
        [priced, unpriced],
        prices,
        dividendTotals,
      );

      expect(result.currencies[0].totalReturnPnl).toBe('520.00');
      expect(result.currencies[0].totalDividends).toBe('25.00');
    });
  });

  describe('closed positions', () => {
    it('computes realized P&L for a closed position from its recorded closePrice, not a live price', () => {
      const closed = buildPosition({
        status: PositionStatus.CLOSED,
        quantity: new Prisma.Decimal('10'),
        averageBuyPrice: new Prisma.Decimal('100'),
        closePrice: new Prisma.Decimal('180'),
      });
      // A live price map entry is deliberately present and different, to
      // prove closed positions ignore it and use closePrice instead.
      const prices = new Map([['AAPL', new Prisma.Decimal('999')]]);

      const result = calculatePortfolioPnl([closed], prices);

      expect(result.currencies[0].positions[0]).toMatchObject({
        status: 'CLOSED',
        currentPrice: '180.00',
        unrealizedPnl: '800.00',
        unrealizedPnlPercent: '80.00',
      });
    });

    it('shows a closed position as price-unavailable when it has no recorded closePrice (closed before the field existed)', () => {
      const closed = buildPosition({
        status: PositionStatus.CLOSED,
        closePrice: null,
      });

      const result = calculatePortfolioPnl([closed], new Map());

      expect(result.currencies[0].positions[0]).toMatchObject({
        status: 'CLOSED',
        currentPrice: null,
        unrealizedPnl: null,
      });
    });

    it('excludes closed positions from the open-only totals (totalCurrentValue, totalUnrealizedPnl, totalReturnPnl)', () => {
      const open = buildPosition({
        id: '1',
        quantity: new Prisma.Decimal('10'),
        averageBuyPrice: new Prisma.Decimal('100'),
      });
      const closed = buildPosition({
        id: '2',
        ticker: 'TSLA',
        status: PositionStatus.CLOSED,
        quantity: new Prisma.Decimal('5'),
        averageBuyPrice: new Prisma.Decimal('200'),
        closePrice: new Prisma.Decimal('300'),
      });
      const prices = new Map([['AAPL', new Prisma.Decimal('150')]]);

      const result = calculatePortfolioPnl([open, closed], prices);

      const [usd] = result.currencies;
      expect(usd.totalCurrentValue).toBe('1500.00'); // open only
      expect(usd.totalUnrealizedPnl).toBe('500.00'); // open only
      expect(usd.totalReturnPnl).toBe('500.00'); // open only
      expect(usd.positions.map((p) => p.status)).toEqual(['OPEN', 'CLOSED']);
    });

    it('includes closed positions in totalPnlAllPositions and totalReturnPnlAllPositions', () => {
      const open = buildPosition({
        id: '1',
        quantity: new Prisma.Decimal('10'),
        averageBuyPrice: new Prisma.Decimal('100'),
      });
      const closed = buildPosition({
        id: '2',
        ticker: 'TSLA',
        status: PositionStatus.CLOSED,
        quantity: new Prisma.Decimal('5'),
        averageBuyPrice: new Prisma.Decimal('200'),
        closePrice: new Prisma.Decimal('300'),
      });
      const prices = new Map([['AAPL', new Prisma.Decimal('150')]]);
      const dividendTotals = new Map([['2', new Prisma.Decimal('10')]]);

      const result = calculatePortfolioPnl(
        [open, closed],
        prices,
        dividendTotals,
      );

      const [usd] = result.currencies;
      // open unrealized 500 + closed realized 500 = 1000
      expect(usd.totalPnlAllPositions).toBe('1000.00');
      // + 10 dividends from the closed position (open position has none)
      expect(usd.totalReturnPnlAllPositions).toBe('1010.00');
      // totalDividends always includes every position regardless of status
      expect(usd.totalDividends).toBe('10.00');
    });

    it('excludes an unpriced closed position from totalPnlAllPositions, same "never fake it" rule as open positions', () => {
      const closedWithoutPrice = buildPosition({
        status: PositionStatus.CLOSED,
        closePrice: null,
      });

      const result = calculatePortfolioPnl([closedWithoutPrice], new Map());

      expect(result.currencies[0].totalPnlAllPositions).toBe('0.00');
    });
  });
});

describe('combineCurrencyTotals', () => {
  function buildSummary(
    overrides: Partial<CurrencyPnlSummary> = {},
  ): CurrencyPnlSummary {
    return {
      currency: 'EUR',
      totalCurrentValue: '1000.00',
      totalUnrealizedPnl: '100.00',
      totalDividends: '10.00',
      totalReturnPnl: '110.00',
      totalPnlAllPositions: '100.00',
      totalReturnPnlAllPositions: '110.00',
      positions: [],
      ...overrides,
    };
  }

  it('returns null for zero currencies', () => {
    expect(combineCurrencyTotals([], 'EUR', new Map())).toBeNull();
  });

  it('passes a single base-currency summary through unconverted', () => {
    const result = combineCurrencyTotals([buildSummary()], 'EUR', new Map());

    expect(result).toMatchObject({
      currency: 'EUR',
      totalCurrentValue: '1000.00',
      totalUnrealizedPnl: '100.00',
      rates: {},
    });
  });

  it('converts a non-base currency using the supplied rate and sums with the base', () => {
    const eur = buildSummary({
      currency: 'EUR',
      totalCurrentValue: '1000.00',
      totalUnrealizedPnl: '100.00',
      totalDividends: '0.00',
      totalReturnPnl: '100.00',
      totalPnlAllPositions: '100.00',
      totalReturnPnlAllPositions: '100.00',
    });
    const usd = buildSummary({
      currency: 'USD',
      totalCurrentValue: '1000.00',
      totalUnrealizedPnl: '200.00',
      totalDividends: '0.00',
      totalReturnPnl: '200.00',
      totalPnlAllPositions: '200.00',
      totalReturnPnlAllPositions: '200.00',
    });
    const rates = new Map([['USD', new Prisma.Decimal('0.9')]]);

    const result = combineCurrencyTotals([eur, usd], 'EUR', rates);

    // 1000 EUR + (1000 USD * 0.9) = 1900.00
    expect(result?.totalCurrentValue).toBe('1900.00');
    // 100 EUR + (200 USD * 0.9) = 280.00
    expect(result?.totalUnrealizedPnl).toBe('280.00');
    expect(result?.rates).toEqual({ USD: '0.9' });
  });

  it('returns null when a rate is missing for a currency actually held, rather than a partial total', () => {
    const eur = buildSummary({ currency: 'EUR' });
    const usd = buildSummary({ currency: 'USD' });

    const result = combineCurrencyTotals([eur, usd], 'EUR', new Map());

    expect(result).toBeNull();
  });
});
