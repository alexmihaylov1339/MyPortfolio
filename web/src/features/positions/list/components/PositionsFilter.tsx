'use client';

import { POSITION_STATUS_OPTIONS } from '../../constants';
import type { PositionStatus } from '../../services';

interface PositionsFilterProps {
  value?: PositionStatus;
  onChange: (value?: PositionStatus) => void;
}

const FILTER_OPTIONS: { value?: PositionStatus; label: string }[] = [
  { value: undefined, label: 'All' },
  ...POSITION_STATUS_OPTIONS,
];

export default function PositionsFilter({ value, onChange }: PositionsFilterProps) {
  return (
    <div className="mb-4 flex gap-2">
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-[4px] px-3 py-1 text-sm ${
            value === option.value
              ? 'bg-brand-accent text-white'
              : 'bg-surface-soft text-ink-strong'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
