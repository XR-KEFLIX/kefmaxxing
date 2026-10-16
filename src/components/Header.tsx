function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 11V6h5" />
      <path d="M21 6h5v5" />
      <path d="M26 21v5h-5" />
      <path d="M11 26H6v-5" />
      <path d="M12.5 11.5v9" />
      <path d="M12.5 16l5.5-4.5" />
      <path d="M14.5 14.5l4 6" />
    </svg>
  )
}

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-content items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <LogoMark className="h-[22px] w-[22px] text-gold" />
          <span className="text-[14px] font-semibold tracking-[-0.01em]">
            kef<span className="text-gold">maxxing</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-[13px] text-secondary sm:flex">
          <a href="#scan" className="transition-colors hover:text-primary">
            rate
          </a>
          <a href="#report" className="transition-colors hover:text-primary">
            report
          </a>
          <a href="#standards" className="transition-colors hover:text-primary">
            standards
          </a>
          <a href="#faq" className="transition-colors hover:text-primary">
            faq
          </a>
        </nav>

        <a href="#scan" className="btn-primary h-8 px-3.5 text-[12.5px]">
          rate me
        </a>
      </div>
    </header>
  )
}
