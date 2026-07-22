import { calculateRebalanceDiff } from './rebalance-diff';
import type { CurrencySummary } from '../positions/positions-summary';

function buildSummary(
  overrides: Partial<CurrencySummary> = {},
): CurrencySummary {
  return {
    currency: 'USD',
    totalInvested: '1000.00',
    byTicker: [],
    byBroker: [],
    ...overrides,
  };
}

describe('calculateRebalanceDiff', () => {
  it('marks a ticker overweight when actual exceeds target', () => {
    const summary = buildSummary({
      byTicker: [{ ticker: 'AAPL', invested: '500.00', percent: '50.00' }],
    });

    const result = calculateRebalanceDiff(summary, [
      { ticker: 'AAPL', targetPercent: '30' },
    ]);

    expect(result.entries).toEqual([
      {
        ticker: 'AAPL',
        actualPercent: '50.00',
        targetPercent: '30.00',
        differencePercent: '20.00',
        status: 'OVERWEIGHT',
      },
    ]);
  });

  it('marks a ticker underweight when actual is below target', () => {
    const summary = buildSummary({
      byTicker: [{ ticker: 'AAPL', invested: '200.00', percent: '20.00' }],
    });

    const result = calculateRebalanceDiff(summary, [
      { ticker: 'AAPL', targetPercent: '50' },
    ]);

    expect(result.entries).toEqual([
      {
        ticker: 'AAPL',
        actualPercent: '20.00',
        targetPercent: '50.00',
        differencePercent: '-30.00',
        status: 'UNDERWEIGHT',
      },
    ]);
  });

  it('marks a ticker on target when actual equals target exactly', () => {
    const summary = buildSummary({
      byTicker: [{ ticker: 'AAPL', invested: '400.00', percent: '40.00' }],
    });

    const result = calculateRebalanceDiff(summary, [
      { ticker: 'AAPL', targetPercent: '40' },
    ]);

    expect(result.entries).toEqual([
      {
        ticker: 'AAPL',
        actualPercent: '40.00',
        targetPercent: '40.00',
        differencePercent: '0.00',
        status: 'ON_TARGET',
      },
    ]);
  });

  it('treats a model-only ticker (not owned) as fully underweight', () => {
    const summary = buildSummary({ byTicker: [] });

    const result = calculateRebalanceDiff(summary, [
      { ticker: 'VOO', targetPercent: '100' },
    ]);

    expect(result.entries).toEqual([
      {
        ticker: 'VOO',
        actualPercent: '0.00',
        targetPercent: '100.00',
        differencePercent: '-100.00',
        status: 'UNDERWEIGHT',
      },
    ]);
  });

  it('treats a held-only ticker (not in the model) as fully overweight', () => {
    const summary = buildSummary({
      byTicker: [{ ticker: 'TSLA', invested: '100.00', percent: '100.00' }],
    });

    const result = calculateRebalanceDiff(summary, []);

    expect(result.entries).toEqual([
      {
        ticker: 'TSLA',
        actualPercent: '100.00',
        targetPercent: '0.00',
        differencePercent: '100.00',
        status: 'OVERWEIGHT',
      },
    ]);
  });

  it('treats zero real positions (null currency summary) as fully underweight for every model ticker', () => {
    const result = calculateRebalanceDiff(null, [
      { ticker: 'AAPL', targetPercent: '30' },
      { ticker: 'VOO', targetPercent: '70' },
    ]);

    expect(result.currency).toBeNull();
    expect(result.entries).toEqual([
      {
        ticker: 'AAPL',
        actualPercent: '0.00',
        targetPercent: '30.00',
        differencePercent: '-30.00',
        status: 'UNDERWEIGHT',
      },
      {
        ticker: 'VOO',
        actualPercent: '0.00',
        targetPercent: '70.00',
        differencePercent: '-70.00',
        status: 'UNDERWEIGHT',
      },
    ]);
  });

  it('sorts entries alphabetically by ticker regardless of input order', () => {
    const summary = buildSummary({
      byTicker: [{ ticker: 'TSLA', invested: '100.00', percent: '50.00' }],
    });

    const result = calculateRebalanceDiff(summary, [
      { ticker: 'VOO', targetPercent: '25' },
      { ticker: 'AAPL', targetPercent: '25' },
    ]);

    expect(result.entries.map((entry) => entry.ticker)).toEqual([
      'AAPL',
      'TSLA',
      'VOO',
    ]);
  });

  it('returns an empty entries array for an empty model (defensive — Step 4 requires >=1 allocation, so this should not be reachable via the API, but the pure function must still behave sensibly if called this way)', () => {
    const result = calculateRebalanceDiff(buildSummary({ byTicker: [] }), []);

    expect(result.entries).toEqual([]);
  });
});
