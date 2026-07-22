import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const TWELVE_DATA_PRICE_URL = 'https://api.twelvedata.com/price';
const CACHE_TTL_MS = 15 * 60 * 1000;

interface CacheEntry {
  price: Prisma.Decimal;
  fetchedAt: number;
}

@Injectable()
export class MarketPricesService {
  private readonly logger = new Logger(MarketPricesService.name);
  private readonly cache = new Map<string, CacheEntry>();

  async getPrice(ticker: string): Promise<Prisma.Decimal | null> {
    const cached = this.cache.get(ticker);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.price;
    }

    const fetched = await this.fetchPrice(ticker);
    if (fetched) {
      this.cache.set(ticker, { price: fetched, fetchedAt: Date.now() });
      return fetched;
    }

    if (cached) {
      this.logger.warn(
        `Falling back to stale cached price for ${ticker} after a failed fetch`,
      );
      return cached.price;
    }

    return null;
  }

  async getPrices(
    tickers: string[],
  ): Promise<Map<string, Prisma.Decimal | null>> {
    const uniqueTickers = Array.from(new Set(tickers));
    const results = await Promise.all(
      uniqueTickers.map(
        async (ticker) => [ticker, await this.getPrice(ticker)] as const,
      ),
    );
    return new Map(results);
  }

  private async fetchPrice(ticker: string): Promise<Prisma.Decimal | null> {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      this.logger.warn(
        'TWELVE_DATA_API_KEY is not set — market prices are unavailable',
      );
      return null;
    }

    try {
      const url = `${TWELVE_DATA_PRICE_URL}?symbol=${encodeURIComponent(ticker)}&apikey=${apiKey.trim()}`;
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(
          `Twelve Data request for ${ticker} failed with status ${response.status}`,
        );
        return null;
      }

      const body: unknown = await response.json();
      const price =
        typeof body === 'object' && body !== null && 'price' in body
          ? (body as { price: unknown }).price
          : undefined;

      if (typeof price !== 'string' || price.trim() === '') {
        this.logger.warn(
          `Twelve Data returned no usable price for ${ticker}: ${JSON.stringify(body)}`,
        );
        return null;
      }

      return new Prisma.Decimal(price);
    } catch (error) {
      this.logger.warn(
        `Twelve Data request for ${ticker} threw an error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
