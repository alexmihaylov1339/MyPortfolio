import { MarketPricesService } from './market-prices.service';

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  });
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
    const service = new MarketPricesService();

    const price = await service.getPrice('AAPL');

    expect(price?.toString()).toBe('150.25');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('serves a fresh cache hit without calling fetch again', async () => {
    mockFetchOnce({ price: '150.25' });
    const service = new MarketPricesService();

    await service.getPrice('AAPL');
    const second = await service.getPrice('AAPL');

    expect(second?.toString()).toBe('150.25');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to a stale cache entry when a later fetch fails', async () => {
    jest.useFakeTimers();
    mockFetchOnce({ price: '150.25' });
    const service = new MarketPricesService();
    await service.getPrice('AAPL');

    jest.advanceTimersByTime(16 * 60 * 1000);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const price = await service.getPrice('AAPL');

    expect(price?.toString()).toBe('150.25');
  });

  it('returns null when there is no cache and the fetch fails', async () => {
    mockFetchOnce({}, false, 500);
    const service = new MarketPricesService();

    const price = await service.getPrice('UNKNOWN');

    expect(price).toBeNull();
  });

  it('returns null without calling fetch when the API key is missing', async () => {
    delete process.env.TWELVE_DATA_API_KEY;
    const service = new MarketPricesService();

    const price = await service.getPrice('AAPL');

    expect(price).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('dedupes tickers and returns a map keyed by ticker', async () => {
    mockFetchOnce({ price: '150.25' });
    const service = new MarketPricesService();

    const prices = await service.getPrices(['AAPL', 'AAPL']);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(prices.get('AAPL')?.toString()).toBe('150.25');
  });
});
