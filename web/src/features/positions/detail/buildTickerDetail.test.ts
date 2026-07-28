import { buildTickerDetail } from './buildTickerDetail';
import type { Position } from '@features/positions/services';
import type { PositionPnl } from '@features/dashboard/services';

function buildPosition(overrides: Partial<Position> = {}): Position {
  return {
    id: 'p1',
    broker: 'REVOLUT',
    ticker: 'AAPL',
    assetType: 'STOCK',
    quantity: '1',
    averageBuyPrice: '100',
    currency: 'USD',
    status: 'OPEN',
    openedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function buildPnl(overrides: Partial<PositionPnl> = {}): PositionPnl {
  return {
    positionId: 'p1',
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

describe('buildTickerDetail', () => {
  it('returns null when no position of this ticker exists', () => {
    const result = buildTickerDetail('AAPL', [], new Map(), false, false);
    expect(result).toBeNull();
  });

  it('aggregates a single open lot', () => {
    const position = buildPosition({ id: 'p1', quantity: '10', averageBuyPrice: '100' });
    const pnl = buildPnl({
      positionId: 'p1',
      quantity: '10',
      currentPrice: '150.00',
      currentValue: '1500.00',
      unrealizedPnl: '500.00',
    });

    const result = buildTickerDetail('AAPL', [position], new Map([['p1', pnl]]), false, false);

    expect(result).toMatchObject({
      sharesHeld: '10.00',
      currentPrice: '150.00',
      currentValue: '1500.00',
      averageBuyPrice: '100.00',
      totalInvested: '1000.00',
      unrealizedPnl: '500.00',
      realizedPnl: '0.00',
      totalPnl: '500.00',
      totalPnlPercent: '50.00',
    });
  });

  it('weight-averages the buy price and price across two open lots', () => {
    const p1 = buildPosition({ id: 'p1', quantity: '10', averageBuyPrice: '100' });
    const p2 = buildPosition({ id: 'p2', quantity: '10', averageBuyPrice: '200' });
    const pnlMap = new Map([
      ['p1', buildPnl({ positionId: 'p1', quantity: '10', currentPrice: '150.00', currentValue: '1500.00', unrealizedPnl: '500.00' })],
      ['p2', buildPnl({ positionId: 'p2', quantity: '10', currentPrice: '150.00', currentValue: '1500.00', unrealizedPnl: '-500.00' })],
    ]);

    const result = buildTickerDetail('AAPL', [p1, p2], pnlMap, false, false);

    expect(result?.sharesHeld).toBe('20.00');
    expect(result?.averageBuyPrice).toBe('150.00');
    expect(result?.currentValue).toBe('3000.00');
    expect(result?.unrealizedPnl).toBe('0.00');
  });

  it('excludes closed lots from averageBuyPrice/totalInvested when includeClosedPositions is false', () => {
    const open = buildPosition({ id: 'p1', quantity: '10', averageBuyPrice: '100' });
    const closed = buildPosition({
      id: 'p2',
      status: 'CLOSED',
      quantity: '5',
      averageBuyPrice: '300',
      closedAt: '2024-02-01T00:00:00.000Z',
    });
    const pnlMap = new Map([
      ['p1', buildPnl({ positionId: 'p1', quantity: '10', currentPrice: '150.00', currentValue: '1500.00', unrealizedPnl: '500.00' })],
      ['p2', buildPnl({ positionId: 'p2', status: 'CLOSED', quantity: '5', currentPrice: '350.00', currentValue: '1750.00', unrealizedPnl: '250.00' })],
    ]);

    const withoutClosed = buildTickerDetail('AAPL', [open, closed], pnlMap, false, false);
    expect(withoutClosed?.averageBuyPrice).toBe('100.00');
    expect(withoutClosed?.totalInvested).toBe('1000.00');
    expect(withoutClosed?.lots).toHaveLength(1);
    expect(withoutClosed?.totalPnl).toBe('500.00');

    const withClosed = buildTickerDetail('AAPL', [open, closed], pnlMap, true, false);
    // (10*100 + 5*300) / 15 = 166.67
    expect(withClosed?.averageBuyPrice).toBe('166.67');
    expect(withClosed?.totalInvested).toBe('2500.00');
    expect(withClosed?.lots).toHaveLength(2);
    // unrealized 500 + realized 250 = 750
    expect(withClosed?.totalPnl).toBe('750.00');
    expect(withClosed?.realizedPnl).toBe('250.00');
  });

  it('keeps sharesHeld/currentValue OPEN-only regardless of the closed-positions toggle', () => {
    const open = buildPosition({ id: 'p1', quantity: '10', averageBuyPrice: '100' });
    const closed = buildPosition({ id: 'p2', status: 'CLOSED', quantity: '5', averageBuyPrice: '300' });
    const pnlMap = new Map([
      ['p1', buildPnl({ positionId: 'p1', quantity: '10', currentValue: '1500.00' })],
      ['p2', buildPnl({ positionId: 'p2', status: 'CLOSED', quantity: '5', currentValue: '1750.00' })],
    ]);

    const withClosed = buildTickerDetail('AAPL', [open, closed], pnlMap, true, false);
    expect(withClosed?.sharesHeld).toBe('10.00');
    expect(withClosed?.currentValue).toBe('1500.00');
  });

  it('always sums dividends across every lot, regardless of includeClosedPositions', () => {
    const open = buildPosition({ id: 'p1', quantity: '10', averageBuyPrice: '100' });
    const closed = buildPosition({ id: 'p2', status: 'CLOSED', quantity: '5', averageBuyPrice: '300' });
    const pnlMap = new Map([
      ['p1', buildPnl({ positionId: 'p1', quantity: '10', totalDividends: '20.00' })],
      ['p2', buildPnl({ positionId: 'p2', status: 'CLOSED', quantity: '5', totalDividends: '5.00' })],
    ]);

    const withoutClosed = buildTickerDetail('AAPL', [open, closed], pnlMap, false, false);
    expect(withoutClosed?.totalDividends).toBe('25.00');

    const withClosed = buildTickerDetail('AAPL', [open, closed], pnlMap, true, false);
    expect(withClosed?.totalDividends).toBe('25.00');
  });

  it('adds dividends into totalPnl only when includeDividends is true', () => {
    const position = buildPosition({ id: 'p1', quantity: '10', averageBuyPrice: '100' });
    const pnl = buildPnl({
      positionId: 'p1',
      quantity: '10',
      currentValue: '1500.00',
      unrealizedPnl: '500.00',
      totalDividends: '25.00',
    });
    const pnlMap = new Map([['p1', pnl]]);

    const withoutDividends = buildTickerDetail('AAPL', [position], pnlMap, false, false);
    expect(withoutDividends?.totalPnl).toBe('500.00');

    const withDividends = buildTickerDetail('AAPL', [position], pnlMap, false, true);
    expect(withDividends?.totalPnl).toBe('525.00');
  });

  it('resolves exchangeMicCode from a held lot when one has it set', () => {
    const withMic = buildPosition({ id: 'p1', exchangeMicCode: 'AAPL.US' });
    const result = buildTickerDetail('AAPL', [withMic], new Map([['p1', buildPnl()]]), false, false);

    expect(result?.exchangeMicCode).toBe('AAPL.US');
  });

  it('reports exchangeMicCode as null when no lot has one', () => {
    const noMic = buildPosition({ id: 'p1' });
    const result = buildTickerDetail('AAPL', [noMic], new Map([['p1', buildPnl()]]), false, false);

    expect(result?.exchangeMicCode).toBeNull();
  });

  it('reports realizedPnl as 0.00 (not null) when there are no closed lots', () => {
    const position = buildPosition({ id: 'p1' });
    const result = buildTickerDetail('AAPL', [position], new Map([['p1', buildPnl()]]), true, false);

    expect(result?.realizedPnl).toBe('0.00');
  });

  it('excludes an unpriced open lot from currentValue/averagePrice math but still counts its quantity in averageBuyPrice', () => {
    const priced = buildPosition({ id: 'p1', quantity: '10', averageBuyPrice: '100' });
    const unpriced = buildPosition({ id: 'p2', quantity: '5', averageBuyPrice: '200' });
    const pnlMap = new Map([
      ['p1', buildPnl({ positionId: 'p1', quantity: '10', currentPrice: '150.00', currentValue: '1500.00', unrealizedPnl: '500.00' })],
      ['p2', buildPnl({ positionId: 'p2', quantity: '5', currentPrice: null, currentValue: null, unrealizedPnl: null })],
    ]);

    const result = buildTickerDetail('AAPL', [priced, unpriced], pnlMap, false, false);

    // current value/price only reflect the priced lot
    expect(result?.currentValue).toBe('1500.00');
    expect(result?.currentPrice).toBe('150.00');
    // but average buy price and total invested still count both lots — cost basis is known regardless of live pricing
    expect(result?.sharesHeld).toBe('15.00');
    expect(result?.totalInvested).toBe('2000.00');
  });
});
