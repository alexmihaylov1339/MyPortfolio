import type { CurrencyPnlSummary } from '../services';

interface CurrencyPnlCardProps {
  summary: CurrencyPnlSummary;
  includeDividends: boolean;
  includeClosedPositions: boolean;
}

function pnlColorClass(value: string): string {
  if (value.startsWith('-')) return 'text-destructive-text';
  if (value === '0.00') return 'text-ink-muted';
  return 'text-success-text';
}

export default function CurrencyPnlCard({
  summary,
  includeDividends,
  includeClosedPositions,
}: CurrencyPnlCardProps) {
  const totalPnl = includeClosedPositions
    ? includeDividends
      ? summary.totalReturnPnlAllPositions
      : summary.totalPnlAllPositions
    : includeDividends
      ? summary.totalReturnPnl
      : summary.totalUnrealizedPnl;

  const visiblePositions = includeClosedPositions
    ? summary.positions
    : summary.positions.filter((position) => position.status === 'OPEN');

  return (
    <div className="rounded-[var(--radius-card)] border border-line-soft p-4 shadow-card">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink-strong">{summary.currency}</h2>
        <div className="text-right">
          <div className="text-lg font-semibold text-ink-strong">
            {summary.totalCurrentValue} {summary.currency}
          </div>
          <div className={`text-sm font-medium ${pnlColorClass(totalPnl)}`}>
            {totalPnl} {summary.currency}
            {includeDividends && summary.totalDividends !== '0.00' && (
              <span className="ml-1 font-normal text-ink-faint">
                (incl. {summary.totalDividends} dividends)
              </span>
            )}
          </div>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {visiblePositions.map((position) => {
          const pnl = includeDividends ? position.totalReturnPnl : position.unrealizedPnl;
          const pnlPercent = includeDividends
            ? position.totalReturnPnlPercent
            : position.unrealizedPnlPercent;

          return (
            <li key={position.positionId} className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-ink-strong">{position.ticker}</span>
                  {position.status === 'CLOSED' && (
                    <span className="rounded-full bg-surface-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                      Closed
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-faint">
                  {position.quantity} sh
                  {position.currentPrice
                    ? ` @ ${position.currentPrice} ${summary.currency}`
                    : ' · price unavailable'}
                </div>
              </div>
              <div className="text-right">
                {position.currentPrice === null ? (
                  <span className="text-xs text-ink-faint">
                    {includeDividends && position.totalDividends !== '0.00'
                      ? `${position.totalDividends} ${summary.currency} in dividends`
                      : 'Price unavailable'}
                  </span>
                ) : (
                  <span className={pnlColorClass(pnl ?? '0.00')}>
                    {pnl} {summary.currency} ({pnlPercent}%)
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
