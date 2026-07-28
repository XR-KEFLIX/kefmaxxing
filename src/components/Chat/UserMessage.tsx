import type { Message } from '../../lib/types'

/**
 * User message: right-aligned pill on the elevated surface — evenly rounded
 * (`bubble`, 20px), solid fill. A hairline border appears in light mode only,
 * where white-on-cream would otherwise lose its edge.
 */
export function UserMessage({ message }: { message: Message }) {
  return (
    <div className="max-w-[70%] rounded-bubble border border-transparent bg-elevated px-4 py-3 light:border-border">
      <p className="whitespace-pre-wrap text-[15px] leading-[1.7] text-primary">{message.content}</p>
    </div>
  )
}
