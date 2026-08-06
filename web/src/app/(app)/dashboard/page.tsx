'use client';

import { useMemo } from 'react';

import { PageLoader, ErrorMessage, ToggleSwitch } from '@shared/components';
import { usePersistedToggle } from '@shared/hooks';

import {
  useDashboardSummaryQuery,
  usePortfolioPnlQuery,
  CurrencySummaryCard,
  CurrencyPnlCard,
  CombinedPnlCard,
  PositionCountsSummary,
  DashboardEmptyState,
  type TickerPriceInfo,
} from '@features/dashboard';

export default function DashboardPage() {
  const { data: summary, isLoading, isError } = useDashboardSummaryQuery();
  const {
    data: pnl,
    isLoading: isPnlLoading,
    isError: isPnlError,
  } = usePortfolioPnlQuery();
  const [includeDividends, setIncludeDividends] = usePersistedToggle(
    'dashboard:includeDividends',
    false,
  );
  const [includeClosedPositions, setIncludeClosedPositions] = usePersistedToggle(
    'dashboard:includeClosedPositions',
    false,
  );
  const hasNoPositions =
    !!summary &&
    summary.positionCounts.open === 0 &&
    summary.positionCounts.closed === 0;

  // The cost-basis summary (percent-of-portfolio breakdown) and the P&L
  // endpoint (current price/quantity) are deliberately separate — cost
  // basis stays correct even when pricing fails. Joined client-side here
  // so the cost-basis card can still show current price/shares per ticker.
  const tickerPriceInfoByCurrency = useMemo(() => {
    const byCurrency = new Map<string, Map<string, TickerPriceInfo>>();
    for (const currencyPnl of pnl?.currencies ?? []) {
      const byTicker = new Map<string, TickerPriceInfo>();
      for (const position of currencyPnl.positions) {
        if (position.status !== 'OPEN') continue;
        const existing = byTicker.get(position.ticker);
        byTicker.set(position.ticker, {
          quantity: (Number(existing?.quantity ?? 0) + Number(position.quantity)).toString(),
          currentPrice: existing?.currentPrice ?? position.currentPrice,
        });
      }
      byCurrency.set(currencyPnl.currency, byTicker);
    }
    return byCurrency;
  }, [pnl]);

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-ink-strong">Dashboard</h1>

      {isLoading && <PageLoader />}
      {isError && (
        <ErrorMessage message="Could not load your portfolio summary." />
      )}

      {summary && hasNoPositions && <DashboardEmptyState />}

      {summary && !hasNoPositions && (
        <>
          <PositionCountsSummary
            open={summary.positionCounts.open}
            closed={summary.positionCounts.closed}
          />

          {summary.currencies.length === 0 ? (
            <p className="text-ink-muted">No open positions right now.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {summary.currencies.map((currency) => (
                <CurrencySummaryCard
                  key={currency.currency}
                  summary={currency}
                  tickerPriceInfo={tickerPriceInfoByCurrency.get(currency.currency)}
                />
              ))}
            </div>
          )}

          <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line-soft bg-surface-soft px-4 py-3">
            <h2 className="text-sm font-semibold uppercase text-ink-faint">
              Live P&amp;L
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <ToggleSwitch
                label="Include dividends"
                checked={includeDividends}
                onChange={setIncludeDividends}
              />
              <ToggleSwitch
                label="Include closed positions"
                checked={includeClosedPositions}
                onChange={setIncludeClosedPositions}
              />
            </div>
          </div>
          {pnl?.combinedTotal && (
            <CombinedPnlCard
              combinedTotal={pnl.combinedTotal}
              includeDividends={includeDividends}
              includeClosedPositions={includeClosedPositions}
            />
          )}
          {isPnlLoading && <PageLoader />}
          {isPnlError && (
            <ErrorMessage message="Could not load live P&L. Cost-basis figures above are still accurate." />
          )}
          {pnl &&
            (pnl.currencies.length === 0 ? (
              <p className="text-ink-muted">No positions to show right now.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pnl.currencies.map((currency) => (
                  <CurrencyPnlCard
                    key={currency.currency}
                    summary={currency}
                    includeDividends={includeDividends}
                    includeClosedPositions={includeClosedPositions}
                  />
                ))}
              </div>
            ))}
        </>
      )}
    </>
  );
}
