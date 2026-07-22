import { Prisma } from '@prisma/client';

import { MarketPricesService } from './market-prices.service';

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
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
  const originalApiKey = process.env.TWELVE_DATA_API_KEY;

  beforeEach(() => {
    global.fetch = jest.fn();
    process.env.TWELVE_DATA_API_KEY = 'test-key';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.TWELVE_DATA_API_KEY = originalApiKey;
    jest.useRealTimers();
  });

  it('fetches and returns a price on a cache miss', async () => {
    mockFetchOnce({ price: '150.25' });
    const service = new MarketPricesService({} as never);

    const price = await service.getPrice('AAPL');

    expect(price?.toString()).toBe('150.25');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('serves a fresh cache hit without calling fetch again', async () => {
    mockFetchOnce({ price: '150.25' });
    const service = new MarketPricesService({} as never);

    await service.getPrice('AAPL');
    const second = await service.getPrice('AAPL');

    expect(second?.toString()).toBe('150.25');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to a stale cache entry when a later fetch fails', async () => {
    jest.useFakeTimers();
    mockFetchOnce({ price: '150.25' });
    const service = new MarketPricesService({} as never);
    await service.getPrice('AAPL');

    jest.advanceTimersByTime(16 * 60 * 1000);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const price = await service.getPrice('AAPL');

    expect(price?.toString()).toBe('150.25');
  });

  it('returns null when there is no cache and the fetch fails', async () => {
    mockFetchOnce({}, false, 500);
    const service = new MarketPricesService({} as never);

    const price = await service.getPrice('UNKNOWN');

    expect(price).toBeNull();
  });

  it('returns null without calling fetch when the API key is missing', async () => {
    delete process.env.TWELVE_DATA_API_KEY;
    const service = new MarketPricesService({} as never);

    const price = await service.getPrice('AAPL');

    expect(price).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('dedupes identical ticker+exchange requests and returns a map keyed by ticker', async () => {
    mockFetchOnce({ price: '150.25' });
    const service = new MarketPricesService({} as never);

    const prices = await service.getPrices([
      { ticker: 'AAPL' },
      { ticker: 'AAPL' },
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(prices.get('AAPL')?.toString()).toBe('150.25');
  });

  it('passes mic_code through to Twelve Data and caches it separately from the bare ticker', async () => {
    // Same ticker, two different companies on two different exchanges — a
    // real scenario (e.g. "DSN" is Danske Bank in Germany vs. an unrelated
    // US OTC stock). Each must be fetched and cached independently.
    mockFetchOnce({ price: '100.50' });
    mockFetchOnce({ price: '5.25' });
    const service = new MarketPricesService({} as never);

    const german = await service.getPrice('DSN', 'XETR');
    const bare = await service.getPrice('DSN');

    expect(german?.toString()).toBe('100.5');
    expect(bare?.toString()).toBe('5.25');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const calls = (global.fetch as jest.Mock).mock.calls as string[][];
    expect(calls[0][0]).toContain('mic_code=XETR');
    expect(calls[1][0]).not.toContain('mic_code');
  });

  it('getPrices dedupes by ticker+exchange, not ticker alone', async () => {
    mockFetchOnce({ price: '100.00' });
    mockFetchOnce({ price: '5.00' });
    const service = new MarketPricesService({} as never);

    await service.getPrices([
      { ticker: 'DSN', micCode: 'XETR' },
      { ticker: 'DSN', micCode: null },
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  describe('searchSymbols', () => {
    it('maps Twelve Data search results', async () => {
      mockFetchOnce({
        data: [
          {
            symbol: 'DSN',
            instrument_name: 'Danske Bank A/S',
            exchange: 'XETR',
            mic_code: 'XETR',
            country: 'Germany',
            currency: 'EUR',
            instrument_type: 'Common Stock',
          },
        ],
      });
      const service = new MarketPricesService({} as never);

      const results = await service.searchSymbols('DSN');

      expect(results).toEqual([
        {
          symbol: 'DSN',
          name: 'Danske Bank A/S',
          exchange: 'XETR',
          micCode: 'XETR',
          country: 'Germany',
          currency: 'EUR',
          instrumentType: 'Common Stock',
        },
      ]);
    });

    it('returns an empty list without calling fetch for a blank query', async () => {
      const service = new MarketPricesService({} as never);

      const results = await service.searchSymbols('   ');

      expect(results).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns an empty list when the API key is missing', async () => {
      delete process.env.TWELVE_DATA_API_KEY;
      const service = new MarketPricesService({} as never);

      const results = await service.searchSymbols('DSN');

      expect(results).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns an empty list when the request fails', async () => {
      mockFetchOnce({}, false, 500);
      const service = new MarketPricesService({} as never);

      const results = await service.searchSymbols('DSN');

      expect(results).toEqual([]);
    });
  });

  describe('price persistence (survives a server restart)', () => {
    it('persists a freshly fetched price to the database', async () => {
      mockFetchOnce({ price: '150.25' });
      const prisma = mockPrisma();
      const service = new MarketPricesService(prisma as never);

      await service.getPrice('AAPL', 'XNAS');

      expect(prisma.marketPrice.upsert).toHaveBeenCalledTimes(1);
      const call = prisma.marketPrice.upsert.mock.calls[0][0];
      expect(call.where).toEqual({
        ticker_micCode: { ticker: 'AAPL', micCode: 'XNAS' },
      });
      expect(call.create.ticker).toBe('AAPL');
      expect(call.create.micCode).toBe('XNAS');
      expect(call.create.price.toString()).toBe('150.25');
      expect(call.update.price.toString()).toBe('150.25');
      expect(call.update.fetchedAt).toBeInstanceOf(Date);
    });

    it('falls back to a database-persisted price when there is no in-memory cache and the live fetch fails', async () => {
      // Simulates a server restart: the in-memory cache is empty (a fresh
      // service instance), but a price for this ticker was persisted by an
      // earlier successful fetch — that's the whole point of persisting it.
      mockFetchOnce({}, false, 500);
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
      mockFetchOnce({ price: '150.25' });
      const prisma = mockPrisma();
      const service = new MarketPricesService(prisma as never);

      await service.getPrice('AAPL');
      prisma.marketPrice.findUnique.mockClear();
      await service.getPrice('AAPL');

      expect(prisma.marketPrice.findUnique).not.toHaveBeenCalled();
    });

    it('still returns null when neither a fetch nor a persisted price is available', async () => {
      mockFetchOnce({}, false, 500);
      const prisma = mockPrisma();
      const service = new MarketPricesService(prisma as never);

      const price = await service.getPrice('UNKNOWN');

      expect(price).toBeNull();
    });
  });
});
