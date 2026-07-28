import { useEffect, useRef, useState } from 'react'
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { IconButton } from '../ui/IconButton'

interface MessageActionsProps {
  content: string
  /** Present only on the last assistant message — removes it and re-streams. */
  onRetry?: () => void
}

/**
 * copy / retry / thumbs row under an assistant message.
 * Copy shows a check for 1.5s on success. Thumbs are toggle-only visual state
 * (per spec, no logic).
 */
export function MessageActions({ content, onRetry }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState<'up' | 'down' | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (permissions) — ignore
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      <IconButton label={copied ? 'Copied' : 'Copy'} onClick={copy}>
        {copied ? <Check className="text-accent" /> : <Copy />}
      </IconButton>
      {onRetry && (
        <IconButton label="Retry" onClick={onRetry}>
          <RefreshCw />
        </IconButton>
      )}
      <IconButton
        label="Good response"
        aria-pressed={rating === 'up'}
        onClick={() => setRating((r) => (r === 'up' ? null : 'up'))}
        className={rating === 'up' ? 'text-accent' : undefined}
      >
        <ThumbsUp />
      </IconButton>
      <IconButton
        label="Bad response"
        aria-pressed={rating === 'down'}
        onClick={() => setRating((r) => (r === 'down' ? null : 'down'))}
        className={rating === 'down' ? 'text-accent' : undefined}
      >
        <ThumbsDown />
      </IconButton>
    </div>
  )
}
