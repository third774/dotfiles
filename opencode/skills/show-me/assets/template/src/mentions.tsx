import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import {
  InnerLine,
  type AnnotationHandler,
  type CustomLine,
  type InlineAnnotationComponent,
} from "codehike/code"
import "./mentions.css"

/**
 * Code mentions connect a phrase in the prose to lines or tokens in a nearby
 * code block. In MDX, write `[phrase](mention:target)` inside a
 * `<MentionScope>`, and mark the code with `// !mention target`, a line range
 * such as `// !mention(1:3) target`, or a token range such as
 * `// !mention[/expr/] target`.
 *
 * Hover or focus previews a target; a click pins it until another click or
 * Escape. While a target is active, the scope dims the other lines of each
 * annotated code block. Targets resolve only inside their own scope.
 */

const MENTION_PREFIX = "mention:"

type Scope = {
  /** The previewed target, else the pinned target, else null. */
  active: string | null
  pinned: string | null
  preview: (target: string | null) => void
  togglePin: (target: string) => void
}

const MentionContext = createContext<Scope | null>(null)

export function MentionScope({ children }: { children: ReactNode }) {
  if (useContext(MentionContext) !== null) {
    throw new Error("MentionScope cannot be inside another MentionScope")
  }

  const [pinned, setPinned] = useState<string | null>(null)
  const [previewed, setPreviewed] = useState<string | null>(null)
  const element = useRef<HTMLDivElement>(null)
  const active = previewed ?? pinned

  useEffect(() => {
    const root = element.current
    if (root === null) return
    const mentioned = new Set<string>()
    for (const button of root.querySelectorAll<HTMLElement>("[data-mention-target]")) {
      const target = button.dataset.mentionTarget
      if (target !== undefined) mentioned.add(target)
    }
    const annotated = new Set<string>()
    for (const code of root.querySelectorAll<HTMLElement>("[data-mention]")) {
      const target = code.dataset.mention
      if (target !== undefined) annotated.add(target)
    }
    for (const target of mentioned) {
      if (!annotated.has(target)) {
        console.error(`Code mention "${target}" has no "!mention ${target}" annotation in its scope`)
      }
    }
    for (const target of annotated) {
      if (!mentioned.has(target)) {
        console.error(`Annotation "!mention ${target}" has no [phrase](mention:${target}) link in its scope`)
      }
    }
  }, [])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || active === null) return
    setPinned(null)
    setPreviewed(null)
  }

  const scope: Scope = {
    active,
    pinned,
    preview: setPreviewed,
    togglePin: (target) => setPinned((current) => (current === target ? null : target)),
  }

  return (
    <MentionContext value={scope}>
      <div
        ref={element}
        className="mention-scope"
        data-mention-active={active ?? undefined}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </MentionContext>
  )
}

function useScope(target: string): Scope {
  const scope = useContext(MentionContext)
  if (scope === null) {
    throw new Error(`Code mention "${target}" must be inside a MentionScope`)
  }
  return scope
}

function Mention({ target, children }: { target: string; children: ReactNode }) {
  const scope = useScope(target)
  return (
    <button
      type="button"
      className="mention"
      data-mention-target={target}
      aria-pressed={scope.pinned === target}
      onMouseEnter={() => scope.preview(target)}
      onMouseLeave={() => scope.preview(null)}
      onFocus={() => scope.preview(target)}
      onBlur={() => scope.preview(null)}
      onClick={() => scope.togglePin(target)}
    >
      {children}
    </button>
  )
}

/** MDX `a` component: renders `mention:` links as mentions, other links unchanged. */
export function Link(props: ComponentProps<"a">) {
  const { href } = props
  if (href === undefined || !href.startsWith(MENTION_PREFIX)) return <a {...props} />
  const target = href.slice(MENTION_PREFIX.length)
  if (target === "") throw new Error(`Code mention "${href}" has no target`)
  return <Mention target={target}>{props.children}</Mention>
}

const MentionLine: CustomLine = ({ annotation, ...props }) => {
  const active = useContext(MentionContext)?.active ?? null
  const target = annotation?.query
  return (
    <InnerLine
      merge={props}
      data-mention-line=""
      data-mention={target}
      data-mention-on={target !== undefined && target === active ? "" : undefined}
    />
  )
}

const MentionInline: InlineAnnotationComponent = ({ annotation, children }) => {
  const active = useContext(MentionContext)?.active ?? null
  return (
    <span
      data-mention={annotation.query}
      data-mention-on={annotation.query === active ? "" : undefined}
    >
      {children}
    </span>
  )
}

export const mention: AnnotationHandler = {
  name: "mention",
  onlyIfAnnotated: true,
  Line: MentionLine,
  Inline: MentionInline,
}
