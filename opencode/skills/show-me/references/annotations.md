# Code blocks and annotations

For Code Hike 1.1.0. Checked against upstream documentation on 2026-10-15.
These are implementation notes, not a required presentation design. Examples
belong in the generated app only when needed; keep the shared template empty.

## Rendering contract

Sources: [code blocks](https://codehike.org/docs/concepts/code),
[annotations](https://codehike.org/docs/concepts/annotations).

The template compiles highlighting through `remarkCodeHike` and `recmaCodeHike`.
Its MDX `Code` component receives a `codeblock: HighlightedCode` prop. Pass that
object to `<Pre code={codeblock} style={codeblock.style} handlers={handlers} />`.
Import `Pre`, `HighlightedCode`, and `AnnotationHandler` from `codehike/code`.
Do not copy the upstream async `highlight(RawCode, theme)` examples into browser
rendering. Highlight during the build.

Each annotation needs a handler with the same `name`. Pass all required handlers
to `Pre`; also write the CSS and components they use. Names such as `focus` and
`mark` are conventions, not features enabled by the template.

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

Check the combined CSS and handlers, not the wrap handler alone. Line-number
wrappers and rules such as `min-width: max-content` can prevent wrapping. Keep
line numbers outside the wrapping text, allow the code column to shrink, and
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

The upstream pattern pairs `[description](hover:target)` in prose with
`// !hover target` on a code line. A custom MDX `a` component recognizes the
`hover:` prefix. The handler exposes `annotation.query` as a data attribute on
the target line. A common container scopes the prose and the code.

The docs use CSS `:has()` and hover selectors for each target. For keyboard and
touch use, render mention controls as buttons, and use focus and activation as
well as hover. For many targets, use local React context with a selected target
instead of generating one CSS rule per identifier. Keep normal links as links.
Scope target identifiers to their code block so repeated names do not activate
unrelated excerpts. Keep the explanation understandable when no target is active.

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
