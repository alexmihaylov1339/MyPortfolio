import type { RebalanceEntry } from '../services';

interface RebalanceTableProps {
  entries: RebalanceEntry[];
  currency: string;
}

const STATUS_LABELS: Record<RebalanceEntry['status'], string> = {
  OVERWEIGHT: 'Overweight',
  UNDERWEIGHT: 'Underweight',
  ON_TARGET: 'On target',
};

const STATUS_COLORS: Record<RebalanceEntry['status'], string> = {
  OVERWEIGHT: 'text-destructive-text',
  UNDERWEIGHT: 'text-brand',
  ON_TARGET: 'text-success-text',
};

export default function RebalanceTable({ entries, currency }: RebalanceTableProps) {
  if (entries.length === 0) {
    return <p className="text-ink-muted">Nothing to compare yet.</p>;
  }

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line">
          <th className="py-2 pr-4 font-semibold text-ink-strong">Ticker</th>
          <th className="py-2 pr-4 font-semibold text-ink-strong">
            Actual {currency ? `(${currency})` : ''}
          </th>
          <th className="py-2 pr-4 font-semibold text-ink-strong">Target</th>
          <th className="py-2 pr-4 font-semibold text-ink-strong">Difference</th>
          <th className="py-2 font-semibold text-ink-strong">Status</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.ticker} className="border-b border-line-soft">
            <td className="py-2 pr-4">{entry.ticker}</td>
            <td className="py-2 pr-4">{entry.actualPercent}%</td>
            <td className="py-2 pr-4">{entry.targetPercent}%</td>
            <td className="py-2 pr-4">{entry.differencePercent}%</td>
            <td className={`py-2 font-medium ${STATUS_COLORS[entry.status]}`}>
              {STATUS_LABELS[entry.status]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
