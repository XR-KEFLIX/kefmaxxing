import { isValidElement, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../lib/utils'
import { CodeBlock } from './CodeBlock'

/** Flattens a React child tree to plain text (code blocks arrive as nested nodes). */
function toText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(toText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return toText(node.props.children)
  return ''
}

/**
 * Element mapping per spec:
 * - headings: h1 24px / h2 20px / h3 16px, 600 weight, 24px top / 8px bottom
 * - lists: proper indent + markers, 8px rhythm
 * - tables: hairline borders, 14px
 * - blockquote: 2px neutral left border, secondary text
 * - inline code: bg-elevated pill with hairline border, 0.85em mono
 * - fenced code: CodeBlock (blocks come through as <pre><code className="language-x">)
 */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-7 text-[24px] font-semibold tracking-[-0.01em] text-primary first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-6 text-[19px] font-semibold tracking-[-0.01em] text-primary first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-5 text-[16px] font-semibold text-primary first:mt-0">{children}</h3>
  ),
  // Prose column: ~65 characters — the editorial reading measure
  p: ({ children }) => <p className="my-2 max-w-[65ch]">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline decoration-secondary underline-offset-2 transition-colors duration-150 ease-out hover:decoration-primary"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-2 max-w-[65ch] list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 max-w-[65ch] list-decimal space-y-1 pl-6">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 max-w-[65ch] border-l-2 border-border pl-4 text-secondary">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
  strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border px-3 py-1.5 text-left font-medium">{children}</th>
  ),
  td: ({ children }) => <td className="border border-border px-3 py-1.5">{children}</td>,
  // Fenced code block: replace the whole <pre> subtree with CodeBlock.
  pre: ({ children }) => {
    let language = 'text'
    let code = ''
    if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
      const match = /language-([\w-]+)/.exec(children.props.className ?? '')
      if (match) language = match[1]
      code = toText(children.props.children).replace(/\n$/, '')
    }
    return <CodeBlock language={language} code={code} />
  },
  // `code` only ever renders inline code now (blocks are consumed by `pre` above).
  // The incoming className is preserved so `pre` can still read the language.
  code: ({ className, children }) => (
    <code
      className={cn(
        className,
        'rounded-md border border-border bg-elevated px-1.5 py-0.5 font-mono text-[0.85em]',
      )}
    >
      {children}
    </code>
  ),
}

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
