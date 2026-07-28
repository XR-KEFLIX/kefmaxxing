import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import type { Message } from '../../lib/types'
import { MessageList } from './MessageList'

const NEAR_BOTTOM_PX = 80

/**
 * Scroll region + auto-scroll logic (spec):
 * - Content growth (streaming) is followed only while the user is within 80px
 *   of the bottom.
 * - Scrolling up stops following and shows a floating "↓" pill centered above
 *   the composer; clicking it smooth-scrolls to the bottom and resumes follow.
 * The App remounts this per thread (key={threadId}), which resets follow state.
 */
export function ChatArea({ messages }: { messages: Message[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const followingRef = useRef(true)
  const suppressUntilRef = useRef(0)
  const [showPill, setShowPill] = useState(false)

  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = scrollRef.current
    if (!el) return
    if (smooth) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    else el.scrollTop = el.scrollHeight
  }, [])

  // Land at the latest message on mount; follow content growth while near the bottom.
  useEffect(() => {
    if (followingRef.current) scrollToBottom(false)
  }, [messages, scrollToBottom])

  function handleScroll() {
    // Ignore events fired by our own smooth-scroll animation.
    if (Date.now() < suppressUntilRef.current) return
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
    followingRef.current = nearBottom
    setShowPill(!nearBottom)
  }

  function jumpToBottom() {
    followingRef.current = true
    suppressUntilRef.current = Date.now() + 900 // outlast the smooth-scroll animation
    setShowPill(false)
    scrollToBottom(true)
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-content px-6 py-6">
          <MessageList messages={messages} />
        </div>
      </div>

      {showPill && (
        <button
          type="button"
          aria-label="Scroll to bottom"
          onClick={jumpToBottom}
          className="absolute bottom-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-elevated text-secondary shadow-composer transition-colors duration-150 ease-out hover:text-primary"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
