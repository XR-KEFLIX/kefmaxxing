/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg-base) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        hover: 'rgb(var(--bg-hover) / <alpha-value>)',
        primary: 'rgb(var(--text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        faint: 'rgb(var(--text-faint) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        'gold-bright': 'rgb(var(--gold-bright) / <alpha-value>)',
        good: '#4ade80',
        warn: '#fbbf24',
        bad: '#f87171',
        border: 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        content: '960px',
      },
      borderRadius: {
        card: '14px',
        sheet: '20px',
      },
      boxShadow: {
        1: '0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px -12px rgba(0, 0, 0, 0.6)',
        2: '0 2px 4px rgba(0, 0, 0, 0.4), 0 16px 40px -16px rgba(0, 0, 0, 0.7)',
        glow: '0 0 0 1px rgba(216, 184, 120, 0.25), 0 8px 32px -8px rgba(216, 184, 120, 0.22)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { top: '-18%' },
          '100%': { top: '106%' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-up': 'fade-up 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        scan: 'scan 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
