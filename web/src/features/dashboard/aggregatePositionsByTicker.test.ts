import { aggregatePositionsByTicker } from './aggregatePositionsByTicker';
import type { PositionPnl } from './services';

function buildLot(overrides: Partial<PositionPnl> = {}): PositionPnl {
  return {
    positionId: 'id',
    ticker: 'AAPL',
    status: 'OPEN',
    quantity: '1',
    averageBuyPrice: '100',
    currentPrice: '150.00',
    currentValue: '150.00',
    unrealizedPnl: '50.00',
    unrealizedPnlPercent: '50.00',
    totalDividends: '0.00',
    totalReturnPnl: '50.00',
    totalReturnPnlPercent: '50.00',
    ...overrides,
  };
}

describe('aggregatePositionsByTicker', () => {
  it('merges two lots of the same ticker into one row', () => {
    const lots = [
      buildLot({
        positionId: '1',
        quantity: '10',
        averageBuyPrice: '100',
        currentPrice: '150.00',
        currentValue: '1500.00',
        unrealizedPnl: '500.00',
        totalReturnPnl: '500.00',
      }),
      buildLot({
        positionId: '2',
        quantity: '5',
        averageBuyPrice: '120',
        currentPrice: '150.00',
        currentValue: '750.00',
        unrealizedPnl: '150.00',
        totalReturnPnl: '150.00',
      }),
    ];

    const result = aggregatePositionsByTicker(lots);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      ticker: 'AAPL',
      status: 'OPEN',
      quantity: '15',
      currentValue: '2250.00',
      unrealizedPnl: '650.00',
      lotCount: 2,
    });
    // cost basis = 10*100 + 5*120 = 1600; 650 / 1600 = 40.625% -> 40.63
    expect(result[0].unrealizedPnlPercent).toBe('40.63');
  });

  it('does not merge OPEN and CLOSED lots of the same ticker', () => {
    const lots = [
      buildLot({ positionId: '1', status: 'OPEN' }),
      buildLot({ positionId: '2', status: 'CLOSED', currentPrice: '200.00', currentValue: '200.00', unrealizedPnl: '100.00', totalReturnPnl: '100.00' }),
    ];

    const result = aggregatePositionsByTicker(lots);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.status).sort()).toEqual(['CLOSED', 'OPEN']);
  });

  it('keeps different tickers as separate rows', () => {
    const lots = [
      buildLot({ positionId: '1', ticker: 'AAPL' }),
      buildLot({ positionId: '2', ticker: 'MSFT' }),
    ];

    const result = aggregatePositionsByTicker(lots);

    expect(result.map((r) => r.ticker).sort()).toEqual(['AAPL', 'MSFT']);
  });

  it('sums quantity and dividends across lots even when none are priced', () => {
    const lots = [
      buildLot({
        positionId: '1',
        quantity: '10',
        currentPrice: null,
        currentValue: null,
        unrealizedPnl: null,
        unrealizedPnlPercent: null,
        totalReturnPnl: null,
        totalReturnPnlPercent: null,
        totalDividends: '5.00',
      }),
      buildLot({
        positionId: '2',
        quantity: '5',
        currentPrice: null,
        currentValue: null,
        unrealizedPnl: null,
        unrealizedPnlPercent: null,
        totalReturnPnl: null,
        totalReturnPnlPercent: null,
        totalDividends: '3.00',
      }),
    ];

    const result = aggregatePositionsByTicker(lots);

    expect(result[0]).toMatchObject({
      quantity: '15',
      currentPrice: null,
      unrealizedPnl: null,
      totalDividends: '8.00',
      totalReturnPnl: null,
    });
  });

  it('excludes an unpriced lot from the priced totals but still counts its quantity and dividends', () => {
    const lots = [
      buildLot({
        positionId: '1',
        quantity: '10',
        averageBuyPrice: '100',
        currentPrice: '150.00',
        currentValue: '1500.00',
        unrealizedPnl: '500.00',
        totalReturnPnl: '500.00',
        totalDividends: '0.00',
      }),
      buildLot({
        positionId: '2',
        quantity: '5',
        currentPrice: null,
        currentValue: null,
        unrealizedPnl: null,
        unrealizedPnlPercent: null,
        totalReturnPnl: null,
        totalReturnPnlPercent: null,
        totalDividends: '2.00',
      }),
    ];

    const result = aggregatePositionsByTicker(lots);

    expect(result[0]).toMatchObject({
      quantity: '15', // both lots
      currentValue: '1500.00', // priced lot only
      unrealizedPnl: '500.00', // priced lot only
      totalDividends: '2.00', // both lots (dividends aren't pricing-dependent)
    });
  });

  it('derives currentPrice as the value-weighted average across priced lots', () => {
    const lots = [
      buildLot({
        positionId: '1',
        quantity: '10',
        currentPrice: '100.00',
        currentValue: '1000.00',
        unrealizedPnl: '0.00',
        totalReturnPnl: '0.00',
      }),
      buildLot({
        positionId: '2',
        quantity: '10',
        currentPrice: '200.00',
        currentValue: '2000.00',
        unrealizedPnl: '0.00',
        totalReturnPnl: '0.00',
      }),
    ];

    const result = aggregatePositionsByTicker(lots);

    // (1000 + 2000) / (10 + 10) = 150.00
    expect(result[0].currentPrice).toBe('150.00');
  });

  it('returns one row per lot when lots are already unique by ticker+status', () => {
    const lots = [buildLot({ positionId: '1' })];

    const result = aggregatePositionsByTicker(lots);

    expect(result).toHaveLength(1);
    expect(result[0].lotCount).toBe(1);
  });
});
