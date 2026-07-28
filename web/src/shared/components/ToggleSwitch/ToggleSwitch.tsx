'use client';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-strong">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand-accent' : 'bg-line-strong'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[left] ${
            checked ? 'left-4' : 'left-0.5'
          }`}
        />
      </span>
      {label}
    </label>
  );
}
