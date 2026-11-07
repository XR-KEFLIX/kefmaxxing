import { useCallback, useEffect, useRef, useState } from 'react'

export function useCopy(resetMs = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(undefined)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (timer.current) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), resetMs)
      } catch {
        /* Clipboard permission denied. The user can select the text manually. */
      }
    },
    [resetMs],
  )

  return { copied, copy }
}
