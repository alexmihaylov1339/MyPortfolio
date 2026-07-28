import { Prisma } from '@prisma/client';

import { calculateRebalanceDiff } from './rebalance-diff';
import type {
  CurrencyPnlSummary,
  PositionPnl,
} from '../market-prices/portfolio-pnl';

function buildPositionPnl(overrides: Partial<PositionPnl> = {}): PositionPnl {
  return {
    positionId: 'position-id',
    ticker: 'AAPL',
    status: 'OPEN',
    quantity: '1',
    averageBuyPrice: '1',
    currentPrice: '100.00',
    currentValue: '100.00',
    unrealizedPnl: '0.00',
    unrealizedPnlPercent: '0.00',
    totalDividends: '0.00',
    totalReturnPnl: '0.00',
    totalReturnPnlPercent: '0.00',
    ...overrides,
  };
}

function buildCurrencyPnl(
  overrides: Partial<CurrencyPnlSummary> = {},
): CurrencyPnlSummary {
  return {
    currency: 'EUR',
    totalCurrentValue: '0.00',
    totalUnrealizedPnl: '0.00',
    totalDividends: '0.00',
    totalReturnPnl: '0.00',
    totalPnlAllPositions: '0.00',
    totalReturnPnlAllPositions: '0.00',
    positions: [],
    ...overrides,
  };
}

const noRates = new Map<string, Prisma.Decimal>();

describe('calculateRebalanceDiff', () => {
  it('marks a ticker overweight when actual exceeds target', () => {
    const eur = buildCurrencyPnl({
      positions: [buildPositionPnl({ ticker: 'AAPL', currentValue: '500.00' })],
      totalCurrentValue: '500.00',
    });

    const result = calculateRebalanceDiff([eur], 'EUR', noRates, [
      { ticker: 'AAPL', targetPercent: '30' },
    ]);

    expect(result?.entries).toEqual([
      {
        ticker: 'AAPL',
        exchangeMicCode: null,
        actualPercent: '100.00',
        targetPercent: '30.00',
        differencePercent: '70.00',
        actualValue: '500.00',
        targetValue: '150.00',
        differenceValue: '-350.00',
        status: 'OVERWEIGHT',
      },
    ]);
  });

  it('marks a ticker underweight when actual is below target', () => {
    const eur = buildCurrencyPnl({
      positions: [
        buildPositionPnl({ ticker: 'AAPL', currentValue: '200.00' }),
        buildPositionPnl({
          ticker: 'MSFT',
          positionId: 'p2',
          currentValue: '800.00',
        }),
      ],
    });

    const result = calculateRebalanceDiff([eur], 'EUR', noRates, [
      { ticker: 'AAPL', targetPercent: '50' },
    ]);

    const aapl = result?.entries.find((e) => e.ticker === 'AAPL');
    expect(aapl).toEqual({
      ticker: 'AAPL',
      exchangeMicCode: null,
      actualPercent: '20.00',
      targetPercent: '50.00',
      differencePercent: '-30.00',
      actualValue: '200.00',
      targetValue: '500.00',
      differenceValue: '300.00',
      status: 'UNDERWEIGHT',
    });
  });

  it('marks a ticker on target when actual equals target exactly', () => {
    const eur = buildCurrencyPnl({
      positions: [
        buildPositionPnl({ ticker: 'AAPL', currentValue: '400.00' }),
        buildPositionPnl({
          ticker: 'MSFT',
          positionId: 'p2',
          currentValue: '600.00',
        }),
      ],
    });

    const result = calculateRebalanceDiff([eur], 'EUR', noRates, [
      { ticker: 'AAPL', targetPercent: '40' },
    ]);

    const aapl = result?.entries.find((e) => e.ticker === 'AAPL');
    expect(aapl).toMatchObject({
      actualPercent: '40.00',
      differencePercent: '0.00',
      differenceValue: '0.00',
      status: 'ON_TARGET',
    });
  });

  it('treats a model-only ticker (not owned) as fully underweight, with a full-value buy target', () => {
    const eur = buildCurrencyPnl({
      positions: [
        buildPositionPnl({ ticker: 'AAPL', currentValue: '1000.00' }),
      ],
    });

    const result = calculateRebalanceDiff([eur], 'EUR', noRates, [
      { ticker: 'AAPL', targetPercent: '50' },
      { ticker: 'VOO', targetPercent: '50', exchangeMicCode: 'VOO' },
    ]);

    const voo = result?.entries.find((e) => e.ticker === 'VOO');
    expect(voo).toEqual({
      ticker: 'VOO',
      exchangeMicCode: 'VOO',
      actualPercent: '0.00',
      targetPercent: '50.00',
      differencePercent: '-50.00',
      actualValue: '0.00',
      targetValue: '500.00',
      differenceValue: '500.00',
      status: 'UNDERWEIGHT',
    });
  });

  it('treats a held-only ticker (not in the model) as fully overweight', () => {
    const eur = buildCurrencyPnl({
      positions: [buildPositionPnl({ ticker: 'TSLA', currentValue: '100.00' })],
    });

    const result = calculateRebalanceDiff([eur], 'EUR', noRates, []);

    expect(result?.entries).toEqual([
      {
        ticker: 'TSLA',
        exchangeMicCode: null,
        actualPercent: '100.00',
        targetPercent: '0.00',
        differencePercent: '100.00',
        actualValue: '100.00',
        targetValue: '0.00',
        differenceValue: '-100.00',
        status: 'OVERWEIGHT',
      },
    ]);
  });

  it('converts a non-base currency into the base currency using the supplied rate', () => {
    const eur = buildCurrencyPnl({
      currency: 'EUR',
      positions: [buildPositionPnl({ ticker: 'AAPL', currentValue: '100.00' })],
    });
    const usd = buildCurrencyPnl({
      currency: 'USD',
      positions: [
        buildPositionPnl({
          ticker: 'MSFT',
          positionId: 'p2',
          currentValue: '100.00',
        }),
      ],
    });
    const rates = new Map([['USD', new Prisma.Decimal('0.9')]]);

    const result = calculateRebalanceDiff([eur, usd], 'EUR', rates, [
      { ticker: 'MSFT', targetPercent: '100' },
    ]);

    // 100 EUR + (100 USD * 0.9) = 190 total; MSFT = 90 / 190
    const msft = result?.entries.find((e) => e.ticker === 'MSFT');
    expect(msft?.actualValue).toBe('90.00');
    expect(msft?.actualPercent).toBe('47.37');
  });

  it('returns null when a currency actually held has no FX rate available', () => {
    const usd = buildCurrencyPnl({
      currency: 'USD',
      positions: [buildPositionPnl({ ticker: 'AAPL', currentValue: '100.00' })],
    });

    const result = calculateRebalanceDiff([usd], 'EUR', noRates, [
      { ticker: 'AAPL', targetPercent: '100' },
    ]);

    expect(result).toBeNull();
  });

  it('marks a ticker PRICE_UNAVAILABLE when its live price is missing, without corrupting the total', () => {
    const eur = buildCurrencyPnl({
      positions: [
        buildPositionPnl({ ticker: 'AAPL', currentValue: '900.00' }),
        buildPositionPnl({
          ticker: 'UNPRICED',
          positionId: 'p2',
          currentPrice: null,
          currentValue: null,
        }),
      ],
    });

    const result = calculateRebalanceDiff([eur], 'EUR', noRates, [
      { ticker: 'AAPL', targetPercent: '100' },
    ]);

    const unpriced = result?.entries.find((e) => e.ticker === 'UNPRICED');
    expect(unpriced).toMatchObject({
      actualPercent: null,
      actualValue: null,
      differencePercent: null,
      differenceValue: null,
      status: 'PRICE_UNAVAILABLE',
    });
    // The total used for AAPL's percent excludes the unpriced ticker entirely.
    const aapl = result?.entries.find((e) => e.ticker === 'AAPL');
    expect(aapl?.actualPercent).toBe('100.00');
  });

  it('excludes CLOSED positions from the actual allocation', () => {
    const eur = buildCurrencyPnl({
      positions: [
        buildPositionPnl({ ticker: 'AAPL', currentValue: '100.00' }),
        buildPositionPnl({
          ticker: 'OLD',
          positionId: 'p2',
          status: 'CLOSED',
          currentValue: '9999.00',
        }),
      ],
    });

    const result = calculateRebalanceDiff([eur], 'EUR', noRates, [
      { ticker: 'AAPL', targetPercent: '100' },
    ]);

    expect(result?.entries.map((e) => e.ticker)).toEqual(['AAPL']);
  });

  it('sorts entries alphabetically by ticker regardless of input order', () => {
    const eur = buildCurrencyPnl({
      positions: [buildPositionPnl({ ticker: 'TSLA', currentValue: '100.00' })],
    });

    const result = calculateRebalanceDiff([eur], 'EUR', noRates, [
      { ticker: 'VOO', targetPercent: '25' },
      { ticker: 'AAPL', targetPercent: '25' },
    ]);

    expect(result?.entries.map((entry) => entry.ticker)).toEqual([
      'AAPL',
      'TSLA',
      'VOO',
    ]);
  });

  it('treats zero real positions as fully underweight for every model ticker', () => {
    const result = calculateRebalanceDiff([], 'EUR', noRates, [
      { ticker: 'AAPL', targetPercent: '30' },
      { ticker: 'VOO', targetPercent: '70' },
    ]);

    expect(result?.baseCurrency).toBe('EUR');
    expect(result?.entries).toEqual([
      {
        ticker: 'AAPL',
        exchangeMicCode: null,
        actualPercent: '0.00',
        targetPercent: '30.00',
        differencePercent: '-30.00',
        actualValue: '0.00',
        targetValue: '0.00',
        differenceValue: '0.00',
        status: 'UNDERWEIGHT',
      },
      {
        ticker: 'VOO',
        exchangeMicCode: null,
        actualPercent: '0.00',
        targetPercent: '70.00',
        differencePercent: '-70.00',
        actualValue: '0.00',
        targetValue: '0.00',
        differenceValue: '0.00',
        status: 'UNDERWEIGHT',
      },
    ]);
  });

  it('returns an empty entries array for an empty model (defensive)', () => {
    const result = calculateRebalanceDiff([], 'EUR', noRates, []);

    expect(result?.entries).toEqual([]);
  });
});
