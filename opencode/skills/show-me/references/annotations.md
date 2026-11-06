# Code blocks and annotations

For Code Hike 1.1.0. Checked against upstream documentation on 2026-11-05.
These are implementation notes, not a required presentation design. Examples
belong in the generated app only when needed; keep the shared template empty.

## Rendering contract

Sources: [code blocks](https://codehike.org/docs/concepts/code),
[annotations](https://codehike.org/docs/concepts/annotations).

The template compiles highlighting through `remarkCodeHike` and `recmaCodeHike`.
Its MDX `Code` component, in `src/code.tsx`, receives a
`codeblock: HighlightedCode` prop and renders it with `CodeBlock`. `CodeBlock`
adds the [file name and line numbers](views.md#file-names-and-line-numbers) and
passes its `handlers` to `Pre`. Import `Pre`, `HighlightedCode`, and
`AnnotationHandler` from `codehike/code`. Do not copy the upstream async
`highlight(RawCode, theme)` examples into browser rendering. Highlight during
the build.

Each annotation needs a handler with the same `name`. Also write the CSS and
components the handler uses. The template's `Code` component passes only the
[`mention`](#code-mentions) handler to `CodeBlock`; add other handlers to the
same array. Names such as `focus` and `mark` are conventions, not features
enabled by the template.

## Annotation syntax

Annotation comments use the code block's language: `//` for JavaScript, `#` for
Python. Use `jsonc` or `json5` when JSON needs annotation comments.

| Syntax | Target |
| --- | --- |
| `// !mark` | The next line |
| `// !mark(1:3)` | The next three lines; offsets are relative to the comment |
| `// !mark[5:12]` | A column range on the next line |
| `// !mark[/name/]` | Text matched by the regular expression |
| `// !mark[/name/gm]` | Multiple matches across lines |
| `// !mark(start)` ... `// !mark(end)` | Lines between the paired comments |
| `// !mark(1:3) gold` | The range plus `annotation.query === "gold"` |

For regular expressions with a capture group, the group selects the inner text.
Use this for folding an attribute value without folding the attribute name.
Check the rendered target after changing an excerpt. Annotation offsets are not
original source line numbers.

## Handler composition

- `Block` wraps an annotated group of lines; `Inline` wraps annotated tokens.
- `Line` and `Token` customize every line or token.
- `AnnotatedLine` and `AnnotatedToken` customize only annotated lines or tokens.
- `Pre` customizes the outer element. Use `PreWithRef` with `getPreRef` when
  measurement or scrolling needs the element reference.
- Use `InnerLine`, `InnerToken`, and `InnerPre` with `merge={props}` to preserve
  the other handlers. Do not replace their content with a raw string.
- `onlyIfAnnotated: true` restricts a handler to blocks that use its annotation.
- `transform` can return a changed annotation or multiple annotations. Preserve
  its range and query unless the transformation intentionally changes them.

Do not mutate the shared highlighted object during React rendering. Derive a
new object and annotation array when interaction changes the active annotations.
Validate custom annotation data before use; do not force its type with a cast.

## Word wrap

Source: [word wrap](https://codehike.org/docs/code/word-wrap).

Use wrapping when horizontal scrolling hides expressions needed for the current
explanation. First check whether a shorter excerpt or a wider panel is clearer.
Keep simultaneous before/after panels only when both remain readable.

The basic approach sets `white-space: pre-wrap` on `Pre`. The upstream handler
also preserves indentation on continuation lines: its `Line` component uses
`props.indentation` for a negative `textIndent` and matching positive `marginLeft`
in `ch` units. Its `Token` component resets `textIndent` to zero. Use `InnerPre`,
`InnerLine`, and `InnerToken` to preserve handler composition.

Check the combined CSS and handlers, not the wrap handler alone. Rules such as
`min-width: max-content` can prevent wrapping. The template's line-number gutter
is a separate flex item beside `.code-line-content`, which can shrink. Apply
wrapping to the code content, keep the gutter outside it, and
check that annotations cover all visual rows of a wrapped source line. Wrapping
must not change source text or create extra source line numbers.

Keep horizontal scrolling for content where it aids comparison or preserves
meaning, not as the default cure for every long line. Do not reduce text size to
fit a panel. Test the longest important expression at desktop and mobile widths.

## Focus

Source: [focus](https://codehike.org/docs/code/focus).

Use focus to guide attention while keeping nearby code visible. A minimal
handler attaches a marker to the selected lines:

```tsx
import { InnerLine, type AnnotationHandler } from "codehike/code"

export const focus: AnnotationHandler = {
  name: "focus",
  onlyIfAnnotated: true,
  AnnotatedLine: ({ annotation, ...props }) => (
    <InnerLine merge={props} data-focus={true} />
  ),
}
```

This handler adds a marker only. Add styles that reduce emphasis on other lines
without making them unreadable. Use a class on the code block to scope those
styles. For changing focus, derive the active annotations from the selected step.

Select only the branch or expression that supports the step's explanation. Split
steps that need several distinct targets. If logging or error handling fills most
of a selection about another mechanism, show a smaller excerpt or make that
supporting detail optional. Do not include an unrelated fallback in a successful
branch's selection. Show a called function when the step explains its internals.

If code can scroll, keep the focused range visible. Use a `PreWithRef` handler,
`getPreRef`, and a layout effect to measure the focused lines inside the code
container. Scroll that container only when the range is outside its viewport.
Check for a null reference and an empty focused range. Use
`querySelectorAll<HTMLElement>` rather than a type assertion. Respect reduced
motion and do not move keyboard focus when a narrative step changes.

## Marks

Source: [mark](https://codehike.org/docs/code/mark).

Use marks for a stable point of interest. For lines, use `AnnotatedLine` with
`InnerLine` and a marker attribute, or a `Line` handler that checks `annotation`.
For token ranges, use an `Inline` handler that wraps `children` in a styled span.
The upstream pattern uses `annotation.query` for an optional color. Prefer a
small set of named styles when colors indicate meaning. Include a border,
symbol, or text label so that meaning does not depend on color alone.

A mark should tell the reader where to look within the excerpt. Marking nearly
the entire block usually adds no guidance. Prefer an inline mark for a specific
operator, option, or field; use a callout when its meaning needs a visible note.

## Code mentions

Source: [code mentions](https://codehike.org/docs/code/code-mentions).

Code mentions are the default way to point from prose to code in HTML output.
The template implements them in `src/mentions.tsx` and registers them in
`src/main.tsx`. Do not write a new handler. In the copied app's MDX:

````mdx
<MentionScope>

The [empty-input check](mention:guard) returns before the store call. Otherwise
the handler [saves the parsed value](mention:save) and returns its
[generated id](mention:id).

```ts src/handler.ts:12-17
export function handle(input: string) {
  // !mention guard
  if (input === "") return null
  // !mention(1:2) save
  const value = parse(input)
  const record = store.save(value)
  // !mention[/record\.id/] id
  return record.id
}
```

</MentionScope>
````

This is a syntax example, not a required narrative. The pieces:

- `[phrase](mention:target)` renders the phrase as a toggle button. Other links
  stay normal links.
- `// !mention target` marks the next line. `// !mention(1:3) target` marks a
  line range, and `// !mention[/regex/] target` marks tokens. One line can have
  one line-level target.
- `<MentionScope>` groups the prose and the code blocks it refers to. Target
  names resolve only inside their scope, so repeat short names such as `guard`
  in other scopes. Scopes cannot nest. Use one scope for each section or
  excerpt, not one for the whole page.

Hover or keyboard focus previews a target. A click or tap pins it; a second
click or Escape clears it. The active target gets a highlight and a side marker,
and the other lines of each annotated block in the scope are dimmed. The scope
logs a console error for a mention without an annotation, or an annotation
without a mention. Treat these errors as failed verification.

Use mentions wherever a sentence says "this check", "the second call", "the
fallback", or names a value that the reader must find in the excerpt. A static
mark shows one fixed point; mentions let each sentence select its own evidence.
Write prose that is complete without interaction; the mention adds the location.

Keep mention phrases to a few words, because a button does not wrap across
lines. Target the smallest expression or branch that proves the sentence. Put
the scope's code next to its prose so the reader can see both together. To
change colors for the page, set `--mention-text-highlight`,
`--mention-code-highlight`, `--mention-code-marker`, and `--mention-dim-opacity`
on `.mention-scope` in `src/styles.css`. Do not combine mentions with a
[focus](#focus) handler on the same block unless their dimming styles agree.

## Callouts

Source: [callout](https://codehike.org/docs/code/callout).

Use `// !callout[/expression/] Explanation` to place a note at an expression.
The upstream handler transforms an `InlineAnnotation` into a block annotation:

1. Set both block line bounds to the inline annotation's `lineNumber`.
2. Preserve `name` and `query`.
3. Store `(fromColumn + toColumn) / 2` as the arrow's column in custom data.
4. Render `children`, then the note from `annotation.query` in a `Block` handler.

Check custom data before using it for positioning. Column positions in `ch` units
assume a monospace font. Account for indentation, horizontal scrolling, and narrow
screens. A note below the line can be clearer than a precisely positioned arrow.
Do not make an essential callout hover-only or render its query as raw HTML.
