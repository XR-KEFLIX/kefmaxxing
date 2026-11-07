export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <p className="font-display text-[20px] tracking-[-0.02em] text-ink">Kefmaxxing</p>
          <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-ink2">
            A multi-dimensional facial aesthetics analysis with a transparent method. One photo, ten dimensions, a
            realistic plan, and no single score deciding your face.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-ink3">Photos are not stored by this app</p>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <nav className="mt-3 grid gap-2 text-[12.5px] text-ink2" aria-label="Footer">
            <a href="#analysis" className="transition-colors hover:text-ink">
              Analysis
            </a>
            <a href="#method" className="transition-colors hover:text-ink">
              Method
            </a>
            <a href="#evidence" className="transition-colors hover:text-ink">
              Evidence
            </a>
            <a href="#faq" className="transition-colors hover:text-ink">
              FAQ
            </a>
          </nav>
        </div>

        <div>
          <p className="eyebrow">Read this first</p>
          <p className="mt-3 text-[12px] leading-relaxed text-ink2">
            This is cosmetic and grooming guidance, not medical advice. Attractiveness is partly subjective and
            culturally variable. A score describes one photo, not your worth. See a qualified professional for skin,
            dental, jaw or mental health concerns.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-ink3">
            © {new Date().getFullYear()} Kefmaxxing
          </p>
        </div>
      </div>
    </footer>
  )
}
