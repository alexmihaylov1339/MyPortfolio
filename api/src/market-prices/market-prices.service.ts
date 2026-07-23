import { Injectable, Logger } from '@nestjs/common';
import { Prisma, PositionStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  calculatePortfolioPnl,
  type PortfolioPnlResponse,
} from './portfolio-pnl';

// Yahoo Finance's public (unofficial, undocumented, no-API-key) endpoints.
// Switched to from Twelve Data because Twelve Data's free plan gates real,
// non-exotic listings behind a paid tier (confirmed: every exchange listing
// of Danske Bank A/S, live price *and* end-of-day/historical, all returned
// "available starting with the Grow or Venture plan"). Yahoo has no such
// gate and needs no signup, at the cost of being an unofficial endpoint
// Yahoo could change or rate-limit without notice — acceptable for a
// personal single-user dashboard, revisit if it ever becomes unreliable.
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search';
// Yahoo's edge returns 429 on every request without a browser-like UA.
const YAHOO_HEADERS = { 'User-Agent': 'Mozilla/5.0' };
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_SEARCH_RESULTS = 10;
const SEARCHABLE_QUOTE_TYPES = new Set(['EQUITY', 'ETF']);

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

interface YahooSearchQuote {
  symbol: string;
  quoteType: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
}

function isYahooSearchQuote(value: unknown): value is YahooSearchQuote {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.symbol === 'string' && typeof record.quoteType === 'string'
  );
}

// Yahoo's symbol is a single string combining ticker + exchange suffix
// (e.g. "DSN.F" for Danske Bank on Frankfurt, plain "AAPL" for Nasdaq).
// The suffix is exactly what's needed to query the right instrument, but
// showing it as the position's ticker would be ugly ("DSN.F" instead of
// "DSN") — split it so the clean part is stored as ticker and the full
// Yahoo symbol is stored as the disambiguating "micCode".
function splitYahooSymbol(symbol: string): string {
  const dotIndex = symbol.indexOf('.');
  return dotIndex === -1 ? symbol : symbol.slice(0, dotIndex);
}

// A cache key combines ticker + exchange qualifier, not the bare ticker —
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
    // Both statuses are fetched — CLOSED positions still need their
    // dividends and their own closePrice-based P&L, they just don't need
    // a live market price (see calculatePortfolioPnl for how each is priced).
    const positions = await this.prisma.position.findMany({
      where: { userId },
    });

    const openPositions = positions.filter(
      (position) => position.status === PositionStatus.OPEN,
    );
    const prices = await this.getPrices(
      openPositions.map((position) => ({
        ticker: position.ticker,
        micCode: position.exchangeMicCode,
      })),
    );
    const dividendTotals = await this.getDividendTotals(
      positions.map((position) => position.id),
    );

    return calculatePortfolioPnl(positions, prices, dividendTotals);
  }

  private async getDividendTotals(
    positionIds: string[],
  ): Promise<Map<string, Prisma.Decimal>> {
    if (positionIds.length === 0) {
      return new Map();
    }

    const sums = await this.prisma.dividend.groupBy({
      by: ['positionId'],
      where: { positionId: { in: positionIds } },
      _sum: { amount: true },
    });

    return new Map(
      sums.map((sum) => [
        sum.positionId,
        sum._sum.amount ?? new Prisma.Decimal(0),
      ]),
    );
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
      await this.persistPrice(ticker, micCode, fetched);
      return fetched;
    }

    if (cached) {
      this.logger.warn(
        `Falling back to stale in-memory price for ${key} after a failed fetch`,
      );
      return cached.price;
    }

    // No in-memory cache — e.g. right after a server restart, which wipes
    // it entirely. Fall back to the last price ever successfully fetched
    // and persisted for this ticker+exchange, rather than reporting
    // unavailable just because the process restarted.
    const persisted = await this.loadPersistedPrice(ticker, micCode);
    if (persisted) {
      this.cache.set(key, {
        price: persisted.price,
        fetchedAt: persisted.fetchedAt.getTime(),
      });
      this.logger.warn(
        `Falling back to database-persisted price for ${key} (fetched ${persisted.fetchedAt.toISOString()}) after a failed fetch`,
      );
      return persisted.price;
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

  async searchSymbols(query: string): Promise<TickerSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const url = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(trimmed)}&quotesCount=${MAX_SEARCH_RESULTS}&newsCount=0`;
      const response = await fetch(url, { headers: YAHOO_HEADERS });
      if (!response.ok) {
        this.logger.warn(
          `Yahoo Finance symbol search for "${query}" failed with status ${response.status}`,
        );
        return [];
      }

      const body: unknown = await response.json();
      const quotes =
        typeof body === 'object' &&
        body !== null &&
        'quotes' in body &&
        Array.isArray(body.quotes)
          ? (body as { quotes: unknown[] }).quotes
          : [];

      return quotes
        .filter(isYahooSearchQuote)
        .filter((quote) => SEARCHABLE_QUOTE_TYPES.has(quote.quoteType))
        .slice(0, MAX_SEARCH_RESULTS)
        .map((quote) => ({
          symbol: splitYahooSymbol(quote.symbol),
          name: quote.shortname ?? quote.longname ?? quote.symbol,
          exchange: quote.exchDisp ?? '',
          micCode: quote.symbol,
          country: '',
          currency: '',
          instrumentType: quote.quoteType,
        }));
    } catch (error) {
      this.logger.warn(
        `Yahoo Finance symbol search for "${query}" threw an error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private async fetchPrice(
    ticker: string,
    micCode?: string | null,
  ): Promise<Prisma.Decimal | null> {
    const querySymbol = micCode?.trim() || ticker;

    try {
      const url = `${YAHOO_CHART_URL}/${encodeURIComponent(querySymbol)}`;
      const response = await fetch(url, { headers: YAHOO_HEADERS });
      if (!response.ok) {
        this.logger.warn(
          `Yahoo Finance request for ${querySymbol} failed with status ${response.status}`,
        );
        return null;
      }

      const body: unknown = await response.json();
      const price = this.extractRegularMarketPrice(body);

      if (price === null) {
        this.logger.warn(
          `Yahoo Finance returned no usable price for ${querySymbol}: ${JSON.stringify(body)}`,
        );
        return null;
      }

      return new Prisma.Decimal(price);
    } catch (error) {
      this.logger.warn(
        `Yahoo Finance request for ${querySymbol} threw an error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private extractRegularMarketPrice(body: unknown): number | null {
    if (typeof body !== 'object' || body === null || !('chart' in body)) {
      return null;
    }
    const chart = body.chart;
    if (typeof chart !== 'object' || chart === null || !('result' in chart)) {
      return null;
    }
    const result = chart.result;
    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }
    const first: unknown = result[0];
    if (typeof first !== 'object' || first === null || !('meta' in first)) {
      return null;
    }
    const meta = first.meta;
    if (
      typeof meta !== 'object' ||
      meta === null ||
      !('regularMarketPrice' in meta)
    ) {
      return null;
    }
    const price = meta.regularMarketPrice;
    return typeof price === 'number' && Number.isFinite(price) ? price : null;
  }

  private async persistPrice(
    ticker: string,
    micCode: string | null | undefined,
    price: Prisma.Decimal,
  ): Promise<void> {
    try {
      await this.prisma.marketPrice.upsert({
        where: { ticker_micCode: { ticker, micCode: micCode ?? '' } },
        create: { ticker, micCode: micCode ?? '', price },
        update: { price, fetchedAt: new Date() },
      });
    } catch (error) {
      // A persistence failure shouldn't prevent returning the freshly
      // fetched price to the caller — the in-memory cache still has it.
      this.logger.warn(
        `Failed to persist price for ${cacheKey(ticker, micCode)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async loadPersistedPrice(
    ticker: string,
    micCode?: string | null,
  ): Promise<{ price: Prisma.Decimal; fetchedAt: Date } | null> {
    try {
      const record = await this.prisma.marketPrice.findUnique({
        where: { ticker_micCode: { ticker, micCode: micCode ?? '' } },
      });
      return record
        ? { price: record.price, fetchedAt: record.fetchedAt }
        : null;
    } catch (error) {
      this.logger.warn(
        `Failed to load persisted price for ${cacheKey(ticker, micCode)}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
