import type { CombinedPnlTotal } from '../services';

interface CombinedPnlCardProps {
  combinedTotal: CombinedPnlTotal;
  includeDividends: boolean;
  includeClosedPositions: boolean;
}

function pnlColorClass(value: string): string {
  if (value.startsWith('-')) return 'text-destructive-text';
  if (value === '0.00') return 'text-ink-muted';
  return 'text-success-text';
}

export default function CombinedPnlCard({
  combinedTotal,
  includeDividends,
  includeClosedPositions,
}: CombinedPnlCardProps) {
  const totalPnl = includeClosedPositions
    ? includeDividends
      ? combinedTotal.totalReturnPnlAllPositions
      : combinedTotal.totalPnlAllPositions
    : includeDividends
      ? combinedTotal.totalReturnPnl
      : combinedTotal.totalUnrealizedPnl;

  const otherCurrencies = Object.keys(combinedTotal.rates);

  return (
    <div className="mb-4 rounded-[var(--radius-card)] border border-line-brand-soft bg-brand-soft/40 p-4 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink">
          Total portfolio
        </h2>
        {otherCurrencies.length > 0 && (
          <span className="text-xs text-ink-faint">
            converted at{' '}
            {otherCurrencies
              .map((currency) => `1 ${currency} = ${combinedTotal.rates[currency]} ${combinedTotal.currency}`)
              .join(', ')}
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-semibold text-ink-strong">
          {combinedTotal.totalCurrentValue} {combinedTotal.currency}
        </span>
        <span className={`text-base font-medium ${pnlColorClass(totalPnl)}`}>
          {totalPnl} {combinedTotal.currency}
          {includeDividends && combinedTotal.totalDividends !== '0.00' && (
            <span className="ml-1 font-normal text-ink-faint">
              (incl. {combinedTotal.totalDividends} dividends)
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
