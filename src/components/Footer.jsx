export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <p className="flex items-center gap-2.5 font-display text-[20px] tracking-[-0.02em] text-ink">
            <svg viewBox="0 0 38 38" className="h-6 w-6 text-accent" fill="none" aria-hidden="true">
              <path d="M5.2 30.2a14.6 14.6 0 0 1 27.6 0" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M19 30.2 26.6 18.9" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="19" cy="30.2" r="2.3" fill="currentColor" />
            </svg>
            Kefmaxxing
          </p>
          <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-ink2">
            Get a 10-point read on your features from one photo, plus a realistic plan for what to work on.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-ink3">We do not store your photo</p>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <nav className="mt-3 grid gap-2 text-[12.5px] text-ink2" aria-label="Footer">
            <a href="#analysis" className="transition-colors hover:text-ink">Analysis</a>
            <a href="#method" className="transition-colors hover:text-ink">Method</a>
            <a href="#evidence" className="transition-colors hover:text-ink">Evidence</a>
            <a href="#faq" className="transition-colors hover:text-ink">FAQ</a>
          </nav>
        </div>

        <div className="flex flex-col items-start md:items-end">
          <p className="mt-auto font-mono text-[10px] uppercase tracking-[0.08em] text-ink3">
            (C) {(new Date()).getFullYear()} Kefmaxxing
          </p>
        </div>
      </div>
    </footer>
  )
}
