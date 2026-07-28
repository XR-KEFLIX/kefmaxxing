export function EmptyState() {
  // Composer-first hierarchy: the headline is a subordinate greeting, not the
  // hero. Fraunces keeps the brand voice at a restrained, working size.
  return (
    <h1 className="text-center font-serif text-[26px] font-medium leading-snug tracking-[-0.01em] text-primary sm:text-[30px]">
      What are we working on today?
    </h1>
  )
}
