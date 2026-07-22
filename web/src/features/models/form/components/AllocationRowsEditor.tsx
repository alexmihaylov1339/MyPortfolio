'use client';

import type { AllocationInput } from '../../services';

interface AllocationRowsEditorProps {
  rows: AllocationInput[];
  onChange: (rows: AllocationInput[]) => void;
}

function sumPercent(rows: AllocationInput[]): number {
  const total = rows.reduce((sum, row) => {
    const parsed = Number(row.targetPercent);
    return sum + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);

  // Display-only rounding to reduce (not eliminate) float artifacts in the
  // live hint. The authoritative check is the backend's Decimal-based sum.
  return Math.round(total * 100) / 100;
}

export default function AllocationRowsEditor({
  rows,
  onChange,
}: AllocationRowsEditorProps) {
  const total = sumPercent(rows);
  const isComplete = total === 100;

  const handleRowChange = (
    index: number,
    field: keyof AllocationInput,
    value: string,
  ) => {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleAddRow = () => {
    onChange([...rows, { ticker: '', targetPercent: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-strong">Allocations</span>
        <span
          className={`text-sm font-medium ${
            isComplete ? 'text-success-text' : 'text-destructive-text'
          }`}
        >
          Total: {total}% {isComplete ? '✓' : '(must equal 100%)'}
        </span>
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ticker"
              value={row.ticker}
              onChange={(event) =>
                handleRowChange(index, 'ticker', event.target.value)
              }
              className="w-1/2 rounded-[4px] border border-line px-2 py-1 text-sm"
            />
            <input
              type="number"
              placeholder="%"
              value={row.targetPercent}
              onChange={(event) =>
                handleRowChange(index, 'targetPercent', event.target.value)
              }
              min={0}
              step="0.01"
              className="w-1/3 rounded-[4px] border border-line px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => handleRemoveRow(index)}
              disabled={rows.length <= 1}
              className="cursor-pointer text-sm text-destructive-text hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddRow}
        className="mt-2 cursor-pointer text-sm font-medium text-brand hover:underline"
      >
        + Add row
      </button>
    </div>
  );
}
