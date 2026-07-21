/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand)',
          deep: 'var(--color-brand-deep)',
          hover: 'var(--color-brand-hover)',
          accent: 'var(--color-brand-accent)',
          'accent-hover': 'var(--color-brand-accent-hover)',
          contrast: 'var(--color-brand-contrast)',
          ink: 'var(--color-brand-ink)',
          soft: 'var(--color-brand-soft)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          soft: 'var(--color-surface-soft)',
          muted: 'var(--color-surface-muted)',
          nav: 'var(--color-surface-nav)',
        },
        line: {
          nav: 'var(--color-line-nav)',
          soft: 'var(--color-line-soft)',
          DEFAULT: 'var(--color-line)',
          strong: 'var(--color-line-strong)',
          muted: 'var(--color-line-muted)',
          brand: 'var(--color-line-brand)',
          'brand-soft': 'var(--color-line-brand-soft)',
          'brand-muted': 'var(--color-line-brand-muted)',
        },
        ink: {
          heading: 'var(--color-ink-heading)',
          strong: 'var(--color-ink-strong)',
          muted: 'var(--color-ink-muted)',
          subtle: 'var(--color-ink-subtle)',
          faint: 'var(--color-ink-faint)',
          disabled: 'var(--color-ink-disabled)',
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          strong: 'var(--color-destructive-strong)',
          soft: 'var(--color-destructive-soft)',
          line: 'var(--color-destructive-line)',
          text: 'var(--color-destructive-text)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
          line: 'var(--color-success-line)',
          text: 'var(--color-success-text)',
        },
        info: {
          DEFAULT: 'var(--color-info-text)',
        },
        slate: {
          50: 'var(--color-slate-50)',
          100: 'var(--color-slate-100)',
          200: 'var(--color-slate-200)',
          300: 'var(--color-slate-300)',
          500: 'var(--color-slate-500)',
          600: 'var(--color-slate-600)',
          700: 'var(--color-slate-700)',
          900: 'var(--color-slate-900)',
        },
        gray: {
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          600: 'var(--color-gray-600)',
          800: 'var(--color-gray-800)',
        },
        zinc: {
          50: 'var(--color-zinc-50)',
        },
        blue: {
          500: 'var(--color-blue-500)',
          600: 'var(--color-blue-600)',
          700: 'var(--color-blue-700)',
        },
        emerald: {
          50: 'var(--color-emerald-50)',
          200: 'var(--color-emerald-200)',
          800: 'var(--color-emerald-800)',
          900: 'var(--color-emerald-900)',
        },
        sky: {
          200: 'var(--color-sky-200)',
          700: 'var(--color-sky-700)',
        },
        black: 'var(--color-black)',
        white: 'var(--color-white)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'elevation-sm': 'var(--shadow-elevation-sm)',
        'elevation-md': 'var(--shadow-elevation-md)',
      },
    },
  },
};
