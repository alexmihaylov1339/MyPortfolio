export const THEME_STORAGE_KEY = 'myportfolio-theme';

export const THEMES = ['ledger', 'terminal', 'studio'] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'studio';

export const THEME_LABELS: Record<Theme, string> = {
  ledger: 'Ledger',
  terminal: 'Terminal',
  studio: 'Studio',
};
