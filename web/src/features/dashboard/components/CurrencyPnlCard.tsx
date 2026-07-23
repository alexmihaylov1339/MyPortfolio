import type { CurrencyPnlSummary } from '../services';

interface CurrencyPnlCardProps {
  summary: CurrencyPnlSummary;
  includeDividends: boolean;
}

function pnlColorClass(value: string): string {
  if (value.startsWith('-')) return 'text-destructive-text';
  if (value === '0.00') return 'text-ink-muted';
  return 'text-success-text';
}

export default function CurrencyPnlCard({ summary, includeDividends }: CurrencyPnlCardProps) {
  const totalPnl = includeDividends ? summary.totalReturnPnl : summary.totalUnrealizedPnl;

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

      <ul className="space-y-1 text-sm">
        {summary.positions.map((position) => {
          const pnl = includeDividends ? position.totalReturnPnl : position.unrealizedPnl;
          const pnlPercent = includeDividends
            ? position.totalReturnPnlPercent
            : position.unrealizedPnlPercent;

          return (
            <li key={position.positionId} className="flex justify-between">
              <span>{position.ticker}</span>
              {position.currentPrice === null ? (
                <span className="text-ink-faint">
                  {includeDividends && position.totalDividends !== '0.00'
                    ? `Price unavailable · ${position.totalDividends} ${summary.currency} in dividends`
                    : 'Price unavailable'}
                </span>
              ) : (
                <span className={pnlColorClass(pnl ?? '0.00')}>
                  {pnl} {summary.currency} ({pnlPercent}%)
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
