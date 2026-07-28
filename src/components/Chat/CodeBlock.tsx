import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Check } from 'lucide-react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff'
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby'
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'

// Light build: register only common fence languages instead of bundling all of Prism.
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('diff', diff)
SyntaxHighlighter.registerLanguage('go', go)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('markdown', markdown)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('ruby', ruby)
SyntaxHighlighter.registerLanguage('rust', rust)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('yaml', yaml)

/*
 * Syntax palette in the ember/ink family ONLY (no foreign hues): ember for
 * keywords/functions, a lighter ember tint for strings/literals, off-white
 * base, cool greys for comments/punctuation. Theme is one typed object
 * colocated with the component — no global CSS to keep in sync.
 */
const base: CSSProperties = {
  color: '#EDECE7', // warm off-white base
  background: 'none',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  textShadow: 'none',
  whiteSpace: 'pre',
}

const miloTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': base,
  'pre[class*="language-"]': { ...base, margin: 0, padding: 0 },
  comment: { color: '#6B7079', fontStyle: 'italic' },
  prolog: { color: '#6B7079' },
  doctype: { color: '#6B7079' },
  cdata: { color: '#6B7079' },
  keyword: { color: '#FF6B35' }, // ember
  important: { color: '#FF6B35' },
  selector: { color: '#FF6B35' },
  function: { color: '#FF8256' }, // ember, lifted
  'class-name': { color: '#FF8256' },
  'maybe-class-name': { color: '#FF8256' },
  tag: { color: '#FF8256' },
  string: { color: '#FFB59A' }, // ember tint
  char: { color: '#FFB59A' },
  regex: { color: '#FFB59A' },
  'attr-value': { color: '#FFB59A' },
  number: { color: '#FFB59A' },
  boolean: { color: '#FFB59A' },
  constant: { color: '#FFB59A' },
  'attr-name': { color: '#EDECE7' },
  property: { color: '#EDECE7' },
  operator: { color: '#8B8F99' },
  punctuation: { color: '#8B8F99' },
}

/** Prism language keys differ from common markdown fence aliases. */
const LANGUAGE_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  py: 'python',
  rb: 'ruby',
  yml: 'yaml',
  md: 'markdown',
  text: 'plaintext',
}

interface CodeBlockProps {
  language: string
  code: string
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const prismLanguage = LANGUAGE_ALIASES[language] ?? (language || 'plaintext')

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (permissions) — ignore
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl bg-code-bg font-mono text-sm">
      {/* 36px top bar: language label left, copy right — plain, no marks */}
      <div className="flex h-9 items-center justify-between bg-code-topbar pl-4 pr-3">
        <span className="text-xs text-[#8B8F99]">{language || 'text'}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className="flex items-center gap-1 text-xs text-[#8B8F99] transition-colors duration-150 ease-out hover:text-[#F5F4F0]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            'Copy'
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={prismLanguage}
        style={miloTheme}
        customStyle={{
          margin: 0,
          padding: '14px 16px',
          background: 'transparent',
          overflowX: 'auto', // horizontal scroll for long lines
          lineHeight: '1.6',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
