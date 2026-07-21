import type { CurrencySummary } from '../services';

interface CurrencySummaryCardProps {
  summary: CurrencySummary;
}

export default function CurrencySummaryCard({ summary }: CurrencySummaryCardProps) {
  return (
    <div className="rounded-[8px] border border-line-soft p-4">
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
          <ul className="space-y-1 text-sm">
            {summary.byTicker.map((entry) => (
              <li key={entry.ticker} className="flex justify-between">
                <span>{entry.ticker}</span>
                <span className="text-ink-muted">{entry.percent}%</span>
              </li>
            ))}
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
