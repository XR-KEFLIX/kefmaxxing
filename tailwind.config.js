/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        raised: 'rgb(var(--paper-raised) / <alpha-value>)',
        sunken: 'rgb(var(--paper-sunken) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        ink2: 'rgb(var(--ink-2) / <alpha-value>)',
        ink3: 'rgb(var(--ink-3) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        lineStrong: 'rgb(var(--line-strong) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accentStrong: 'rgb(var(--accent-strong) / <alpha-value>)',
        accentSoft: 'rgb(var(--accent-soft) / <alpha-value>)',
        onAccent: 'rgb(var(--accent-ink) / <alpha-value>)',
        clay: 'rgb(var(--clay) / <alpha-value>)',
        claySoft: 'rgb(var(--clay-soft) / <alpha-value>)',
        good: 'rgb(var(--good) / <alpha-value>)',
        goodSoft: 'rgb(var(--good-soft) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        warnSoft: 'rgb(var(--warn-soft) / <alpha-value>)',
        bad: 'rgb(var(--bad) / <alpha-value>)',
        badSoft: 'rgb(var(--bad-soft) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', '"Book Antiqua"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: {
        page: '1180px',
        prose: '720px',
      },
      borderRadius: {
        card: '10px',
        sheet: '14px',
        button: '6px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--shadow-color) / 0.05), 0 18px 40px -32px rgb(var(--shadow-color) / 0.55)',
        lift: '0 2px 4px rgb(var(--shadow-color) / 0.06), 0 28px 60px -40px rgb(var(--shadow-color) / 0.6)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(18px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'drawer-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'fade-up': 'fade-up 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-in': 'slide-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'drawer-in': 'drawer-in 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        indeterminate: 'indeterminate 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
