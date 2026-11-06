import { useEffect, useMemo } from "react"
import {
  InnerLine,
  Pre,
  type AnnotationHandler,
  type CustomLine,
  type HighlightedCode,
} from "codehike/code"
import { mention } from "./mentions"
import "./code.css"

/**
 * The fence metadata after the language, parsed once at the render boundary.
 *
 * - `path:12-24 label` or `path:12 label` is an excerpt of a codebase file. It
 *   gets a file-name title and a gutter with the original line numbers. The
 *   range must match the excerpt's line count after annotation comments are
 *   removed. The optional label names the revision or side, such as `before`.
 * - Any other text is a title only, such as `Proposed call tree`.
 * - No text renders the block without a title.
 * - A source range that is not valid for the excerpt is `invalid`. The block
 *   renders the message instead of code and logs it as a console error.
 */
export type CodeTitle =
  | { kind: "none" }
  | { kind: "title"; text: string }
  | { kind: "source"; path: string; startLine: number; endLine: number; label: string | null }
  | { kind: "invalid"; message: string }

const SOURCE_TITLE = /^(\S+):(\d+)(?:-(\d+))?(?:\s+(.+))?$/

export function parseCodeTitle(codeblock: HighlightedCode): CodeTitle {
  const text = codeblock.meta.trim()
  if (text === "") return { kind: "none" }
  const match = SOURCE_TITLE.exec(text)
  if (match === null) return { kind: "title", text }
  const [, path, start, end, label] = match
  if (path === undefined || start === undefined) return { kind: "title", text }

  const startLine = Number(start)
  const endLine = end === undefined ? startLine : Number(end)
  if (startLine < 1 || endLine < startLine) {
    return { kind: "invalid", message: `Code block "${text}" has an invalid line range` }
  }
  const expected = endLine - startLine + 1
  const actual = codeblock.code.replace(/\n$/, "").split("\n").length
  if (actual !== expected) {
    return {
      kind: "invalid",
      message: `Code block "${text}" names ${expected} lines but contains ${actual}`,
    }
  }
  return { kind: "source", path, startLine, endLine, label: label ?? null }
}

function sourceLineNumbers(startLine: number, endLine: number): AnnotationHandler {
  const width = `${String(endLine).length}ch`
  const Line: CustomLine = (props) => (
    <div className="code-line">
      <span className="code-line-number" style={{ minWidth: width }} aria-hidden="true">
        {startLine + props.lineNumber - 1}
      </span>
      <InnerLine merge={props} className="code-line-content" />
    </div>
  )
  return { name: "source-line-numbers", Line }
}

function Caption({ title }: { title: Extract<CodeTitle, { kind: "title" | "source" }> }) {
  if (title.kind === "title") return <figcaption>{title.text}</figcaption>
  const lines =
    title.startLine === title.endLine
      ? `line ${title.startLine}`
      : `lines ${title.startLine}–${title.endLine}`
  return (
    <figcaption>
      <code className="code-path">{title.path}</code>
      <span className="code-range">{lines}</span>
      {title.label === null ? null : <span className="code-label">{title.label}</span>}
    </figcaption>
  )
}

/**
 * Renders one highlighted block with its title, source line numbers, and the
 * given annotation handlers. Custom layouts such as tabs reuse this component.
 */
export function CodeBlock({
  codeblock,
  handlers = [],
}: {
  codeblock: HighlightedCode
  handlers?: AnnotationHandler[]
}) {
  const title = parseCodeTitle(codeblock)
  const startLine = title.kind === "source" ? title.startLine : null
  const endLine = title.kind === "source" ? title.endLine : null
  const error = title.kind === "invalid" ? title.message : null

  const lineNumbers = useMemo(
    () => (startLine === null || endLine === null ? null : sourceLineNumbers(startLine, endLine)),
    [startLine, endLine],
  )

  useEffect(() => {
    if (error !== null) console.error(error)
  }, [error])

  if (title.kind === "invalid") {
    return (
      <p className="code-error" role="alert">
        {title.message}
      </p>
    )
  }

  const pre = (
    <Pre
      code={codeblock}
      style={codeblock.style}
      handlers={lineNumbers === null ? handlers : [lineNumbers, ...handlers]}
    />
  )
  if (title.kind === "none") return pre
  return (
    <figure className="code-block">
      <Caption title={title} />
      {pre}
    </figure>
  )
}

/** The MDX `Code` component for fenced code blocks. */
export function Code({ codeblock }: { codeblock: HighlightedCode }) {
  return <CodeBlock codeblock={codeblock} handlers={[mention]} />
}
