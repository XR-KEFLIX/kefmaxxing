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
    <img
      src="/blackpill.svg"
      alt="Kefmaxxing blackpill icon"
      width={44}
      height={44}
      className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
    />
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
            className={`grid h-7 w-7 place-items-center rounded-[5px] transition-colors duration-150 ${
              active ? 'bg-raised text-ink shadow-card' : 'text-ink3 hover:text-ink'
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
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
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Kefmaxxing, back to top">
          <LogoMark />
          <span className="font-display text-[18px] tracking-[-0.02em] text-ink">Kefmaxxing</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-ink2 transition-colors hover:text-ink"
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
            Start analysis
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button type="button" onClick={onOpenChat} className="btn btn-ghost btn-sm px-3" aria-label="Ask Kef">
            <MessageSquare className="h-4 w-4" strokeWidth={1.7} />
            <span className="hidden sm:inline">Ask Kef</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="btn btn-ghost btn-sm px-2.5"
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
                className="rounded-button px-3 py-2.5 text-[14px] font-medium text-ink2 transition-colors hover:bg-sunken hover:text-ink"
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
                className="btn btn-secondary btn-sm"
              >
                Ask Kef
              </button>
              <button
                type="button"
                onClick={() => {
                  close()
                  onStart()
                }}
                className="btn btn-primary btn-sm"
              >
                Start analysis
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
