'use client';

import { THEMES, THEME_LABELS } from '@shared/constants';
import { useTheme } from '../ThemeProvider';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="ml-auto flex gap-1 rounded-[var(--radius-control)] border border-line-soft p-1">
      {THEMES.map((option) => {
        const isActive = option === theme;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setTheme(option)}
            aria-pressed={isActive}
            className={
              isActive
                ? 'rounded-[calc(var(--radius-control)_-_2px)] bg-brand-accent px-3 py-1 text-xs font-semibold text-brand-accent-ink'
                : 'rounded-[calc(var(--radius-control)_-_2px)] px-3 py-1 text-xs font-medium text-ink-muted transition hover:text-brand'
            }
          >
            {THEME_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
