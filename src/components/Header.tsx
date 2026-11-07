import { useState } from 'react'
import { ArrowRight, Menu, MessageSquare, X } from 'lucide-react'

const NAV = [
  { href: '#analysis', label: 'Analysis' },
  { href: '#method', label: 'Method' },
  { href: '#evidence', label: 'Evidence' },
  { href: '#faq', label: 'FAQ' },
]

function LogoMark() {
  return (
    <svg
      viewBox="0 0 28 28"
      className="h-7 w-7 shrink-0 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="23" height="23" rx="2.5" />
      <path d="M9 8v12" />
      <path d="M9 14.5 16 8.5" />
      <path d="M11.5 12.5 19 20" />
    </svg>
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

        <div className="hidden items-center gap-2 lg:flex">
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
