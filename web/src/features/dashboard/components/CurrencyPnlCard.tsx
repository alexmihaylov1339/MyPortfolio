import type { CurrencyPnlSummary } from '../services';

interface CurrencyPnlCardProps {
  summary: CurrencyPnlSummary;
}

function pnlColorClass(value: string): string {
  if (value.startsWith('-')) return 'text-destructive-text';
  if (value === '0.00') return 'text-ink-muted';
  return 'text-success-text';
}

export default function CurrencyPnlCard({ summary }: CurrencyPnlCardProps) {
  return (
    <div className="rounded-[8px] border border-line-soft p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink-strong">{summary.currency}</h2>
        <div className="text-right">
          <div className="text-lg font-semibold text-ink-strong">
            {summary.totalCurrentValue} {summary.currency}
          </div>
          <div className={`text-sm font-medium ${pnlColorClass(summary.totalUnrealizedPnl)}`}>
            {summary.totalUnrealizedPnl} {summary.currency}
          </div>
        </div>
      </div>

      <ul className="space-y-1 text-sm">
        {summary.positions.map((position) => (
          <li key={position.positionId} className="flex justify-between">
            <span>{position.ticker}</span>
            {position.currentPrice === null ? (
              <span className="text-ink-faint">Price unavailable</span>
            ) : (
              <span className={pnlColorClass(position.unrealizedPnl ?? '0.00')}>
                {position.unrealizedPnl} {summary.currency} ({position.unrealizedPnlPercent}%)
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
