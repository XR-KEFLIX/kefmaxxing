import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible label — every icon button must have one. */
  label: string
}

/**
 * Shared icon button primitive: 16px icon inside a perfect circle,
 * secondary color, bg-hover on hover, accent focus ring via global
 * :focus-visible. Circles are the default action-button shape in the
 * pill design language.
 */
export function IconButton({ label, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-1.5 text-secondary',
        'transition-colors duration-150 ease-out',
        'hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40',
        '[&_svg]:h-4 [&_svg]:w-4',
        className,
      )}
      {...props}
    />
  )
}
