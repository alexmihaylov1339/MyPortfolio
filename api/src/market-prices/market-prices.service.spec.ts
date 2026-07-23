import { Prisma } from '@prisma/client';

import { MarketPricesService } from './market-prices.service';

function mockChartFetchOnce(price: number, ok = true, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    json: () =>
      Promise.resolve({
        chart: { result: [{ meta: { regularMarketPrice: price } }] },
      }),
  });
}

function mockFailedFetchOnce(status = 500) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  });
}

interface MarketPriceUpsertArgs {
  where: { ticker_micCode: { ticker: string; micCode: string } };
  create: { ticker: string; micCode: string; price: Prisma.Decimal };
  update: { price: Prisma.Decimal; fetchedAt: Date };
}

function mockPrisma() {
  return {
    marketPrice: {
      upsert: jest
        .fn<Promise<void>, [MarketPriceUpsertArgs]>()
        .mockResolvedValue(undefined),
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
}

describe('MarketPricesService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('fetches and returns a price on a cache miss', async () => {
    mockChartFetchOnce(150.25);
    const service = new MarketPricesService({} as never);

    const price = await service.getPrice('AAPL');

    expect(price?.toString()).toBe('150.25');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('sends a browser-like User-Agent (Yahoo rejects requests without one)', async () => {
    mockChartFetchOnce(150.25);
    const service = new MarketPricesService({} as never);

    await service.getPrice('AAPL');

    const calls = (global.fetch as jest.Mock).mock.calls as [
      string,
      { headers: Record<string, string> },
    ][];
    expect(calls[0][1].headers['User-Agent']).toBeTruthy();
  });

  it('serves a fresh cache hit without calling fetch again', async () => {
    mockChartFetchOnce(150.25);
    const service = new MarketPricesService({} as never);

    await service.getPrice('AAPL');
    const second = await service.getPrice('AAPL');

    expect(second?.toString()).toBe('150.25');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to a stale cache entry when a later fetch fails', async () => {
    jest.useFakeTimers();
    mockChartFetchOnce(150.25);
    const service = new MarketPricesService({} as never);
    await service.getPrice('AAPL');

    jest.advanceTimersByTime(16 * 60 * 1000);
    mockFailedFetchOnce();

    const price = await service.getPrice('AAPL');

    expect(price?.toString()).toBe('150.25');
  });

  it('returns null when there is no cache, no persisted price, and the fetch fails', async () => {
    mockFailedFetchOnce();
    const service = new MarketPricesService({} as never);

    const price = await service.getPrice('UNKNOWN');

    expect(price).toBeNull();
  });

  it('dedupes identical ticker+exchange requests and returns a map keyed by ticker', async () => {
    mockChartFetchOnce(150.25);
    const service = new MarketPricesService({} as never);

    const prices = await service.getPrices([
      { ticker: 'AAPL' },
      { ticker: 'AAPL' },
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(prices.get('AAPL')?.toString()).toBe('150.25');
  });

  it('queries the full exchange-qualified symbol when given, and the bare ticker otherwise', async () => {
    // Same ticker, two different companies on two different exchanges — a
    // real scenario (e.g. "DSN" is Danske Bank on Frankfurt vs. an
    // unrelated instrument under the bare symbol). Each must be fetched
    // and cached independently, using Yahoo's combined ticker.exchange
    // symbol format.
    mockChartFetchOnce(49.18);
    mockChartFetchOnce(5.25);
    const service = new MarketPricesService({} as never);

    const german = await service.getPrice('DSN', 'DSN.F');
    const bare = await service.getPrice('DSN');

    expect(german?.toString()).toBe('49.18');
    expect(bare?.toString()).toBe('5.25');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const calls = (global.fetch as jest.Mock).mock.calls as string[][];
    expect(calls[0][0]).toContain('/DSN.F');
    expect(calls[1][0]).toContain('/DSN');
    expect(calls[1][0]).not.toContain('DSN.F');
  });

  it('getPrices dedupes by ticker+exchange, not ticker alone', async () => {
    mockChartFetchOnce(49.18);
    mockChartFetchOnce(5.25);
    const service = new MarketPricesService({} as never);

    await service.getPrices([
      { ticker: 'DSN', micCode: 'DSN.F' },
      { ticker: 'DSN', micCode: null },
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  describe('searchSymbols', () => {
    it('maps Yahoo Finance search results, splitting the display ticker from the exchange-qualified symbol', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            quotes: [
              {
                symbol: 'DSN.F',
                quoteType: 'EQUITY',
                shortname: 'Danske Bank A/S',
                exchDisp: 'Frankfurt',
              },
            ],
          }),
      });
      const service = new MarketPricesService({} as never);

      const results = await service.searchSymbols('DSN');

      expect(results).toEqual([
        {
          symbol: 'DSN',
          name: 'Danske Bank A/S',
          exchange: 'Frankfurt',
          micCode: 'DSN.F',
          country: '',
          currency: '',
          instrumentType: 'EQUITY',
        },
      ]);
    });

    it('filters out non-equity/ETF quote types (e.g. currencies, crypto, indices)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            quotes: [
              { symbol: 'AAPL', quoteType: 'EQUITY', shortname: 'Apple Inc.' },
              {
                symbol: 'BTC-USD',
                quoteType: 'CRYPTOCURRENCY',
                shortname: 'Bitcoin',
              },
              { symbol: '^GSPC', quoteType: 'INDEX', shortname: 'S&P 500' },
            ],
          }),
      });
      const service = new MarketPricesService({} as never);

      const results = await service.searchSymbols('a');

      expect(results.map((r) => r.symbol)).toEqual(['AAPL']);
    });

    it('returns an empty list without calling fetch for a blank query', async () => {
      const service = new MarketPricesService({} as never);

      const results = await service.searchSymbols('   ');

      expect(results).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns an empty list when the request fails', async () => {
      mockFailedFetchOnce();
      const service = new MarketPricesService({} as never);

      const results = await service.searchSymbols('DSN');

      expect(results).toEqual([]);
    });
  });

  describe('price persistence (survives a server restart)', () => {
    it('persists a freshly fetched price to the database', async () => {
      mockChartFetchOnce(150.25);
      const prisma = mockPrisma();
      const service = new MarketPricesService(prisma as never);

      await service.getPrice('AAPL', 'AAPL');

      expect(prisma.marketPrice.upsert).toHaveBeenCalledTimes(1);
      const call = prisma.marketPrice.upsert.mock.calls[0][0];
      expect(call.where).toEqual({
        ticker_micCode: { ticker: 'AAPL', micCode: 'AAPL' },
      });
      expect(call.create.ticker).toBe('AAPL');
      expect(call.create.micCode).toBe('AAPL');
      expect(call.create.price.toString()).toBe('150.25');
      expect(call.update.price.toString()).toBe('150.25');
      expect(call.update.fetchedAt).toBeInstanceOf(Date);
    });

    it('falls back to a database-persisted price when there is no in-memory cache and the live fetch fails', async () => {
      // Simulates a server restart: the in-memory cache is empty (a fresh
      // service instance), but a price for this ticker was persisted by an
      // earlier successful fetch — that's the whole point of persisting it.
      mockFailedFetchOnce();
      const prisma = mockPrisma();
      const fetchedAt = new Date('2026-01-01T00:00:00.000Z');
      prisma.marketPrice.findUnique.mockResolvedValue({
        ticker: 'AAPL',
        micCode: 'XNAS',
        price: new Prisma.Decimal('142.10'),
        fetchedAt,
      });
      const service = new MarketPricesService(prisma as never);

      const price = await service.getPrice('AAPL', 'XNAS');

      expect(price?.toString()).toBe('142.1');
      expect(prisma.marketPrice.findUnique).toHaveBeenCalledWith({
        where: { ticker_micCode: { ticker: 'AAPL', micCode: 'XNAS' } },
      });
    });

    it('does not query the database when a fresh in-memory cache entry already exists', async () => {
      mockChartFetchOnce(150.25);
      const prisma = mockPrisma();
      const service = new MarketPricesService(prisma as never);

      await service.getPrice('AAPL');
      prisma.marketPrice.findUnique.mockClear();
      await service.getPrice('AAPL');

      expect(prisma.marketPrice.findUnique).not.toHaveBeenCalled();
    });

    it('still returns null when neither a fetch nor a persisted price is available', async () => {
      mockFailedFetchOnce();
      const prisma = mockPrisma();
      const service = new MarketPricesService(prisma as never);

      const price = await service.getPrice('UNKNOWN');

      expect(price).toBeNull();
    });
  });
});
