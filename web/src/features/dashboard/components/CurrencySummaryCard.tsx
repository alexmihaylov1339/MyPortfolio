import Link from 'next/link';

import { APP_ROUTES } from '@shared/constants';

import type { CurrencySummary } from '../services';

export interface TickerPriceInfo {
  quantity: string;
  currentPrice: string | null;
}

interface CurrencySummaryCardProps {
  summary: CurrencySummary;
  tickerPriceInfo?: Map<string, TickerPriceInfo>;
}

export default function CurrencySummaryCard({ summary, tickerPriceInfo }: CurrencySummaryCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line-soft p-4 shadow-card">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink-strong">{summary.currency}</h2>
        <span className="text-lg font-semibold text-ink-strong">
          {summary.totalInvested} {summary.currency}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="mb-1 text-xs font-medium uppercase text-ink-faint">
            By ticker
          </h3>
          <ul className="space-y-1.5 text-sm">
            {summary.byTicker.map((entry) => {
              const priceInfo = tickerPriceInfo?.get(entry.ticker);
              return (
                <li key={entry.ticker} className="flex justify-between gap-2">
                  <div>
                    <Link
                      href={APP_ROUTES.positionDetail(entry.ticker)}
                      className="hover:underline"
                    >
                      {entry.ticker}
                    </Link>
                    {priceInfo && (
                      <div className="text-xs text-ink-faint">
                        {priceInfo.quantity} sh
                        {priceInfo.currentPrice
                          ? ` @ ${priceInfo.currentPrice} ${summary.currency}`
                          : ' · price unavailable'}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-ink-muted">{entry.percent}%</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-medium uppercase text-ink-faint">
            By broker
          </h3>
          <ul className="space-y-1 text-sm">
            {summary.byBroker.map((entry) => (
              <li key={entry.broker} className="flex justify-between">
                <span>{entry.broker}</span>
                <span className="text-ink-muted">{entry.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
