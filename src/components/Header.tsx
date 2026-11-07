import { useState } from 'react'
import { ArrowRight, FlaskConical, Menu, MessageSquare, Moon, Sun, X } from 'lucide-react'
import { getTheme, setTheme, THEME_META, THEMES, type Theme } from '../lib/theme'

const NAV = [
  { href: '#analysis', label: 'Analysis' },
  { href: '#method', label: 'Method' },
  { href: '#evidence', label: 'Evidence' },
  { href: '#faq', label: 'FAQ' },
]

const THEME_ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  void: FlaskConical,
}

function LogoMark() {
  return (
    <svg
      viewBox="0 0 38 38"
      className="h-9 w-9 shrink-0 text-accent sm:h-10 sm:w-10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.2 30.2a14.6 14.6 0 0 1 27.6 0"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M19 30.2 26.6 18.9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="19" cy="30.2" r="2.1" fill="currentColor" />
    </svg>
  )
}

function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(() => getTheme())

  const select = (next: Theme) => {
    setThemeState(next)
    setTheme(next)
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-button border border-line bg-sunken p-0.5"
      role="group"
      aria-label="Colour scheme"
    >
      {THEMES.map((option) => {
        const Icon = THEME_ICONS[option]
        const active = theme === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => select(option)}
            title={THEME_META[option].title}
            aria-label={THEME_META[option].title}
            aria-pressed={active}
            className={`grid h-8 w-8 place-items-center rounded-[5px] transition-colors duration-150 sm:h-7 sm:w-7 ${
              active ? 'bg-raised text-ink shadow-card' : 'text-ink3 hover:text-ink'
            }`}
          >
            <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={1.8} />
          </button>
        )
      })}
    </div>
  )
}

export function Header({ onOpenChat, onStart }: { onOpenChat: () => void; onStart: () => void }) {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="container-page flex h-14 items-center justify-between gap-3 sm:h-16">
        <a href="#top" className="flex min-w-0 items-center gap-2 sm:gap-2.5" aria-label="Kefmaxxing, back to top">
          <LogoMark />
          <span className="truncate font-display text-[16px] tracking-[-0.02em] text-ink sm:text-[18px]">
            Kefmaxxing
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-2 text-[13px] font-medium text-ink2 transition-colors duration-150 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 hover:text-ink hover:after:scale-x-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <button type="button" onClick={onOpenChat} className="btn btn-ghost btn-sm">
            <MessageSquare className="h-4 w-4" strokeWidth={1.7} />
            Ask Kef
          </button>
          <button type="button" onClick={onStart} className="btn btn-primary btn-sm">
            Analyze my photo
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={onOpenChat}
            className="btn btn-ghost btn-sm h-10 w-10 px-0"
            aria-label="Ask Kef"
          >
            <MessageSquare className="h-4 w-4" strokeWidth={1.7} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="btn btn-ghost btn-sm h-10 w-10 px-0"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.7} /> : <Menu className="h-5 w-5" strokeWidth={1.7} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-raised lg:hidden">
          <nav className="container-page grid gap-1 py-4" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex min-h-[48px] items-center rounded-button px-3 text-[15px] font-medium text-ink2 transition-colors hover:bg-sunken hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  close()
                  onOpenChat()
                }}
                className="btn btn-secondary h-12 text-[14px]"
              >
                Ask Kef
              </button>
              <button
                type="button"
                onClick={() => {
                  close()
                  onStart()
                }}
                className="btn btn-primary h-12 text-[14px]"
              >
                Analyze my photo
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
