export function Footer() {
  return (
    <footer className="mt-10 border-t border-border bg-bg">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[14px] font-semibold tracking-[-0.01em]">
          kef<span className="text-gold">maxxing</span>
        </p>
        <p className="font-mono text-[11px] text-faint">© {new Date().getFullYear()} kefmaxxing</p>
      </div>
    </footer>
  )
}
