/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // legacy hook — theming is CSS-var driven via `.light` (dark is default)
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        sidebar: 'rgb(var(--bg-sidebar) / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        hover: 'rgb(var(--bg-hover) / <alpha-value>)',
        primary: 'rgb(var(--text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        'accent-ink': 'rgb(var(--accent-ink) / <alpha-value>)',
        'accent-glow': 'var(--accent-glow)', // pre-alpha'd rgba, used as-is
        'code-bg': 'rgb(var(--code-bg) / <alpha-value>)',
        'code-topbar': 'rgb(var(--code-topbar) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        content: '720px', // reading-width column (~75 chars at 15px) — optimize for reading
      },
      borderRadius: {
        // Pill design system: exactly two named radii on top of the base scale.
        // `pill` — composer + large pill surfaces; `bubble` — user message pills.
        pill: '28px',
        bubble: '20px',
      },
      boxShadow: {
        composer: 'var(--shadow-composer)',
        // Restrained focus ring in accent-glow — warmth without a screenshot-bait bloom
        'composer-glow': '0 0 0 2px var(--accent-glow)',
      },
      keyframes: {
        // streaming cursor: crisp 1s blink, no fade
        blink: {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // active-thread indicator bar: quick vertical grow from center
        'grow-y': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'grow-y': 'grow-y 150ms ease-out',
      },
    },
  },
  plugins: [
    // Dark is the default theme; `.light` on <html> swaps the CSS vars.
    // This variant lets components mark light-only overrides as `light:*`.
    ({ addVariant }) => addVariant('light', '.light &'),
  ],
}
