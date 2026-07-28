'use client';

import Link from 'next/link';

import { PageLoader, ErrorMessage, ToggleSwitch } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { usePersistedToggle } from '@shared/hooks';

import { useTickerDetail, useTickerLookup } from '../hooks';

interface TickerDetailViewProps {
  ticker: string;
  /** Exchange listing hint, e.g. from a model allocation that has no real position yet. */
  micCode?: string | null;
}

function pnlColorClass(value: string | null): string {
  if (value === null) return 'text-ink-faint';
  if (value.startsWith('-')) return 'text-destructive-text';
  if (value === '0.00') return 'text-ink-muted';
  return 'text-success-text';
}

function formatMoney(value: string | null, currency: string): string {
  return value === null ? 'Unavailable' : `${value} ${currency}`;
}

export default function TickerDetailView({ ticker, micCode = null }: TickerDetailViewProps) {
  // Shared across every ticker's detail page (not per-ticker) — this is a
  // viewing preference ("how do I like to see any position"), not data
  // tied to one specific ticker.
  const [includeClosedPositions, setIncludeClosedPositions] = usePersistedToggle(
    'positionDetail:includeClosedPositions',
    false,
  );
  const [includeDividends, setIncludeDividends] = usePersistedToggle(
    'positionDetail:includeDividends',
    false,
  );

  const { detail, isLoading, isError } = useTickerDetail(
    ticker,
    includeClosedPositions,
    includeDividends,
  );

  const noPositionsYet = !isLoading && !isError && !detail;
  const effectiveMicCode = micCode ?? detail?.exchangeMicCode ?? null;
  // Always looked up (not just when there's no position) so the full
  // company name shows in the header regardless of whether you hold it.
  const lookup = useTickerLookup(ticker, effectiveMicCode, true);

  return (
    <>
      <Link href={APP_ROUTES.positions} className="mb-4 inline-block text-sm text-brand hover:underline">
        ← Back to positions
      </Link>

      <h1 className="text-xl font-semibold text-ink-strong">{ticker}</h1>
      {lookup.data?.name && (
        <p className="mb-6 text-sm text-ink-muted">
          {lookup.data.name}
          {lookup.data.exchange && ` · ${lookup.data.exchange}`}
        </p>
      )}
      {!lookup.data?.name && <div className="mb-6" />}

      {isLoading && <PageLoader />}
      {isError && <ErrorMessage message="Could not load this position." />}

      {noPositionsYet && (
        <>
          <p className="mb-4 text-sm text-ink-muted">
            You don&rsquo;t currently hold any position in {ticker}.
          </p>

          {lookup.isLoading && <PageLoader />}
          {lookup.isError && (
            <ErrorMessage message="Could not look up this ticker right now." />
          )}
          {lookup.data && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[var(--radius-card)] border border-line-soft p-4 shadow-card">
                <div className="text-xs font-medium uppercase text-ink-faint">Live price</div>
                <div className="mt-1 text-lg font-semibold text-ink-strong">
                  {lookup.data.price ?? 'Unavailable'}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {detail && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line-soft bg-surface-soft px-4 py-3">
            <h2 className="text-sm font-semibold uppercase text-ink-faint">Options</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <ToggleSwitch
                label="Include closed positions"
                checked={includeClosedPositions}
                onChange={setIncludeClosedPositions}
              />
              <ToggleSwitch
                label="Include dividends"
                checked={includeDividends}
                onChange={setIncludeDividends}
              />
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[var(--radius-card)] border border-line-soft p-4 shadow-card">
              <div className="text-xs font-medium uppercase text-ink-faint">Shares held</div>
              <div className="mt-1 text-lg font-semibold text-ink-strong">{detail.sharesHeld}</div>
            </div>
            <div className="rounded-[var(--radius-card)] border border-line-soft p-4 shadow-card">
              <div className="text-xs font-medium uppercase text-ink-faint">Current value</div>
              <div className="mt-1 text-lg font-semibold text-ink-strong">
                {formatMoney(detail.currentValue, detail.currency)}
              </div>
              <div className="text-xs text-ink-faint">
                {detail.currentPrice ? `@ ${detail.currentPrice} ${detail.currency}` : 'price unavailable'}
              </div>
            </div>
            <div className="rounded-[var(--radius-card)] border border-line-soft p-4 shadow-card">
              <div className="text-xs font-medium uppercase text-ink-faint">Average buy price</div>
              <div className="mt-1 text-lg font-semibold text-ink-strong">
                {formatMoney(detail.averageBuyPrice, detail.currency)}
              </div>
              <div className="text-xs text-ink-faint">
                {formatMoney(detail.totalInvested, detail.currency)} invested
                {includeClosedPositions ? ' (open + closed)' : ' (open only)'}
              </div>
            </div>
            <div className="rounded-[var(--radius-card)] border border-line-soft p-4 shadow-card">
              <div className="text-xs font-medium uppercase text-ink-faint">
                {includeClosedPositions ? 'Total P&L' : 'Unrealized P&L'}
              </div>
              <div className={`mt-1 text-lg font-semibold ${pnlColorClass(detail.totalPnl)}`}>
                {formatMoney(detail.totalPnl, detail.currency)}
                {detail.totalPnlPercent !== null && (
                  <span className="ml-1 text-sm font-normal">({detail.totalPnlPercent}%)</span>
                )}
              </div>
              {includeDividends && detail.totalDividends !== '0.00' && (
                <div className="text-xs text-ink-faint">
                  incl. {detail.totalDividends} {detail.currency} dividends
                </div>
              )}
              {includeClosedPositions && (
                <div className="text-xs text-ink-faint">
                  unrealized {formatMoney(detail.unrealizedPnl, detail.currency)} · realized{' '}
                  {formatMoney(detail.realizedPnl, detail.currency)}
                </div>
              )}
            </div>
          </div>

          <h3 className="mb-2 text-sm font-semibold text-ink-strong">
            Your buys ({detail.lots.length})
          </h3>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="py-2 pr-4 font-semibold text-ink-strong">Broker</th>
                <th className="py-2 pr-4 font-semibold text-ink-strong">Status</th>
                <th className="py-2 pr-4 font-semibold text-ink-strong">Quantity</th>
                <th className="py-2 pr-4 font-semibold text-ink-strong">Avg. price</th>
                <th className="py-2 pr-4 font-semibold text-ink-strong">Current / close</th>
                <th className="py-2 pr-4 font-semibold text-ink-strong">Value</th>
                <th className="py-2 pr-4 font-semibold text-ink-strong">P&amp;L</th>
                <th className="py-2 pr-4 font-semibold text-ink-strong">Dividends</th>
                <th className="py-2 font-semibold text-ink-strong">Opened / Closed</th>
              </tr>
            </thead>
            <tbody>
              {detail.lots.map((lot) => (
                <tr key={lot.positionId} className="border-b border-line-soft">
                  <td className="py-2 pr-4">{lot.broker}</td>
                  <td className="py-2 pr-4">{lot.status}</td>
                  <td className="py-2 pr-4">{lot.quantity}</td>
                  <td className="py-2 pr-4">
                    {lot.averageBuyPrice} {detail.currency}
                  </td>
                  <td className="py-2 pr-4">{formatMoney(lot.price, detail.currency)}</td>
                  <td className="py-2 pr-4">{formatMoney(lot.value, detail.currency)}</td>
                  <td className={`py-2 pr-4 ${pnlColorClass(lot.pnl)}`}>
                    {formatMoney(lot.pnl, detail.currency)}
                  </td>
                  <td className="py-2 pr-4">
                    {lot.totalDividends} {detail.currency}
                  </td>
                  <td className="py-2 text-xs text-ink-faint">
                    {lot.openedAt.slice(0, 10)}
                    {lot.closedAt ? ` → ${lot.closedAt.slice(0, 10)}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
