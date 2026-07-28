import type { Message } from '../../lib/types'

/**
 * User message: left-aligned block (never right-aligned), content-width capped
 * at 70%, bg-user-msg, rounded-2xl, 12px 16px padding — the Claude pattern.
 */
export function UserMessage({ message }: { message: Message }) {
  return (
    <div className="max-w-[70%] rounded-2xl bg-user-msg px-4 py-3">
      <p className="whitespace-pre-wrap text-base leading-[1.65] text-primary">{message.content}</p>
    </div>
  )
}
