import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function Markdown(props: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>,
        h2: ({ children }) => (
          <h2 className="mt-6 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-5 text-base font-semibold text-zinc-900 dark:text-zinc-50">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-300">{children}</p>
        ),
        ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1 pl-5">{children}</ol>,
        li: ({ children }) => <li className="leading-7 text-zinc-700 dark:text-zinc-300">{children}</li>,
        code: ({ children }) => (
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.9em] text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-zinc-50">{children}</pre>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            className="underline decoration-zinc-400 underline-offset-4 hover:decoration-zinc-600 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mt-4 border-l-2 border-zinc-200 pl-4 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            {children}
          </blockquote>
        ),
      }}
    >
      {props.content}
    </ReactMarkdown>
  )
}

export function MarkdownOrEmpty(props: { content?: string | null; empty?: ReactNode }) {
  if (!props.content) return <>{props.empty ?? null}</>
  return <Markdown content={props.content} />
}

