interface PositionCountsSummaryProps {
  open: number;
  closed: number;
}

export default function PositionCountsSummary({
  open,
  closed,
}: PositionCountsSummaryProps) {
  return (
    <div className="mb-6 flex gap-6 text-sm text-ink-muted">
      <span>
        <strong className="text-ink-strong">{open}</strong> open
      </span>
      <span>
        <strong className="text-ink-strong">{closed}</strong> closed
      </span>
    </div>
  );
}
