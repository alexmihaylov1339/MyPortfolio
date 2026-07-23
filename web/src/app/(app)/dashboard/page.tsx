'use client';

import { useState } from 'react';

import { PageLoader, ErrorMessage } from '@shared/components';

import {
  useDashboardSummaryQuery,
  usePortfolioPnlQuery,
} from '@features/dashboard/hooks';
import {
  CurrencySummaryCard,
  CurrencyPnlCard,
  PositionCountsSummary,
  DashboardEmptyState,
} from '@features/dashboard/components';

export default function DashboardPage() {
  const { data: summary, isLoading, isError } = useDashboardSummaryQuery();
  const {
    data: pnl,
    isLoading: isPnlLoading,
    isError: isPnlError,
  } = usePortfolioPnlQuery();
  const [includeDividends, setIncludeDividends] = useState(false);
  const hasNoPositions =
    !!summary &&
    summary.positionCounts.open === 0 &&
    summary.positionCounts.closed === 0;

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
                <CurrencySummaryCard key={currency.currency} summary={currency} />
              ))}
            </div>
          )}

          <div className="mb-3 mt-8 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-ink-faint">
              Live P&amp;L
            </h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={includeDividends}
                onChange={(event) => setIncludeDividends(event.target.checked)}
                className="h-4 w-4 accent-brand-accent"
              />
              Include dividends
            </label>
          </div>
          {isPnlLoading && <PageLoader />}
          {isPnlError && (
            <ErrorMessage message="Could not load live P&L. Cost-basis figures above are still accurate." />
          )}
          {pnl &&
            (pnl.currencies.length === 0 ? (
              <p className="text-ink-muted">No open positions to price right now.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pnl.currencies.map((currency) => (
                  <CurrencyPnlCard
                    key={currency.currency}
                    summary={currency}
                    includeDividends={includeDividends}
                  />
                ))}
              </div>
            ))}
        </>
      )}
    </>
  );
}
