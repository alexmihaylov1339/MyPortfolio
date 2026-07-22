import { Injectable, Logger } from '@nestjs/common';
import { Prisma, PositionStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  calculatePortfolioPnl,
  type PortfolioPnlResponse,
} from './portfolio-pnl';

const TWELVE_DATA_PRICE_URL = 'https://api.twelvedata.com/price';
const TWELVE_DATA_SEARCH_URL = 'https://api.twelvedata.com/symbol_search';
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_SEARCH_RESULTS = 10;

interface CacheEntry {
  price: Prisma.Decimal;
  fetchedAt: number;
}

interface PriceRequest {
  ticker: string;
  micCode?: string | null;
}

export interface TickerSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  micCode: string;
  country: string;
  currency: string;
  instrumentType: string;
}

interface TwelveDataSearchEntry {
  symbol: string;
  mic_code: string;
  instrument_name?: string;
  exchange?: string;
  country?: string;
  currency?: string;
  instrument_type?: string;
}

function isTwelveDataSearchEntry(
  value: unknown,
): value is TwelveDataSearchEntry {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.symbol === 'string' && typeof record.mic_code === 'string'
  );
}

// A cache key combines ticker + exchange mic_code, not the bare ticker —
// the same ticker string can mean entirely different companies on
// different exchanges (e.g. "DSN" is Danske Bank in Germany, an
// Indonesian palm oil company, and a US OTC stock), so caching by ticker
// alone risked silently serving one company's price for another's position.
function cacheKey(ticker: string, micCode?: string | null): string {
  return `${ticker}::${micCode ?? ''}`;
}

@Injectable()
export class MarketPricesService {
  private readonly logger = new Logger(MarketPricesService.name);
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly prisma: PrismaService) {}

  async getPortfolioPnlForUser(userId: string): Promise<PortfolioPnlResponse> {
    const positions = await this.prisma.position.findMany({
      where: { userId, status: PositionStatus.OPEN },
    });

    const prices = await this.getPrices(
      positions.map((position) => ({
        ticker: position.ticker,
        micCode: position.exchangeMicCode,
      })),
    );

    return calculatePortfolioPnl(positions, prices);
  }

  async getPrice(
    ticker: string,
    micCode?: string | null,
  ): Promise<Prisma.Decimal | null> {
    const key = cacheKey(ticker, micCode);
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.price;
    }

    const fetched = await this.fetchPrice(ticker, micCode);
    if (fetched) {
      this.cache.set(key, { price: fetched, fetchedAt: Date.now() });
      return fetched;
    }

    if (cached) {
      this.logger.warn(
        `Falling back to stale cached price for ${key} after a failed fetch`,
      );
      return cached.price;
    }

    return null;
  }

  async getPrices(
    requests: PriceRequest[],
  ): Promise<Map<string, Prisma.Decimal | null>> {
    const uniqueByKey = new Map<string, PriceRequest>();
    for (const request of requests) {
      uniqueByKey.set(cacheKey(request.ticker, request.micCode), request);
    }

    const results = await Promise.all(
      Array.from(uniqueByKey.values()).map(
        async (request) =>
          [
            request.ticker,
            await this.getPrice(request.ticker, request.micCode),
          ] as const,
      ),
    );
    return new Map(results);
  }

  /** Proxies Twelve Data's symbol search so the API key never reaches the frontend. */
  async searchSymbols(query: string): Promise<TickerSearchResult[]> {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey || !apiKey.trim() || !query.trim()) {
      return [];
    }

    try {
      const url = `${TWELVE_DATA_SEARCH_URL}?symbol=${encodeURIComponent(query.trim())}&apikey=${apiKey.trim()}`;
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(
          `Twelve Data symbol search for "${query}" failed with status ${response.status}`,
        );
        return [];
      }

      const body: unknown = await response.json();
      const data =
        typeof body === 'object' &&
        body !== null &&
        'data' in body &&
        Array.isArray(body.data)
          ? (body as { data: unknown[] }).data
          : [];

      return data
        .filter(isTwelveDataSearchEntry)
        .slice(0, MAX_SEARCH_RESULTS)
        .map((entry) => ({
          symbol: entry.symbol,
          name: entry.instrument_name ?? entry.symbol,
          exchange: entry.exchange ?? '',
          micCode: entry.mic_code,
          country: entry.country ?? '',
          currency: entry.currency ?? '',
          instrumentType: entry.instrument_type ?? '',
        }));
    } catch (error) {
      this.logger.warn(
        `Twelve Data symbol search for "${query}" threw an error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private async fetchPrice(
    ticker: string,
    micCode?: string | null,
  ): Promise<Prisma.Decimal | null> {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      this.logger.warn(
        'TWELVE_DATA_API_KEY is not set — market prices are unavailable',
      );
      return null;
    }

    try {
      const micCodeParam = micCode
        ? `&mic_code=${encodeURIComponent(micCode)}`
        : '';
      const url = `${TWELVE_DATA_PRICE_URL}?symbol=${encodeURIComponent(ticker)}${micCodeParam}&apikey=${apiKey.trim()}`;
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
          ? body.price
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
