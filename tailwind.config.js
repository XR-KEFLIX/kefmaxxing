/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // themes swap via `.dark` on <html>; colors come from CSS vars in index.css
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        sidebar: 'rgb(var(--bg-sidebar) / <alpha-value>)',
        'user-msg': 'rgb(var(--bg-user-msg) / <alpha-value>)',
        hover: 'rgb(var(--bg-hover) / <alpha-value>)',
        primary: 'rgb(var(--text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        // spec: accent at 10% opacity, identical in both themes
        'accent-subtle': 'rgb(var(--accent) / 0.1)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        'code-bg': 'rgb(var(--code-bg) / <alpha-value>)',
        'code-topbar': 'rgb(var(--code-topbar) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        content: '768px', // centered content column per spec
      },
      borderRadius: {
        // Pill design system: exactly two named radii on top of the base scale.
        // `pill` — composer + large pill surfaces; `bubble` — user message pills.
        // Perfect circles use Tailwind's `rounded-full` (send/tools/action buttons).
        pill: '28px',
        bubble: '20px',
      },
      boxShadow: {
        composer: 'var(--shadow-composer)', // the only shadow in the app
      },
      keyframes: {
        // streaming cursor: crisp 1s blink, no fade
        blink: {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
