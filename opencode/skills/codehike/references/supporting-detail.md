# Optional supporting detail

For Code Hike 1.1.0. Checked against upstream documentation on 2026-10-15.
Hide detail only when the main explanation is complete without it. Keep the
source available to inspect and label what is hidden.

## Fold

Source: [fold](https://codehike.org/docs/code/fold).

Use folding for a small inline distraction, such as a long class attribute.
For example, `// !fold[/className="(.*?)"/gm]` targets the captured attribute
values, not the surrounding markup.

Implement a `fold` handler with an `Inline` component. That component uses local
React state to show either an expand button or the original `children`. The
upstream example expands once. If a toggle is useful, provide a separate control
that remains available after expansion. Give the button a specific accessible
label, such as "Show class names". Keep keyboard focus usable after expansion.

Do not fold the expression that proves the point being explained. Check that
searching, selecting, and copying code behave as intended when text is hidden.

## Collapse

Source: [collapse](https://codehike.org/docs/code/collapse).

Use collapse for a group of supporting lines. The upstream pattern uses
`// !collapse(1:4)` for a four-line range, and the query `collapsed` to start
closed. It preserves the first line as the trigger and hides the remaining lines.
Choose a range that leaves the code structure understandable when closed.

The implementation transforms the block annotation into three annotations:

1. The original `collapse` range, which establishes shared open/closed state.
2. `CollapseTrigger`, covering the first line only.
3. `CollapseContent`, covering the rest of the range.

Register all three handlers. The docs use shadcn/ui's Collapsible component; an
equivalent local component can supply the same behavior. Use a button with
`aria-expanded` and `aria-controls` for the trigger. Preserve `InnerLine` handler
composition. Validate that the range contains content beyond the trigger.

Do not copy the upstream cast of custom icon data. Render the icon directly or
pass validated data. A native `details`/`summary` section around a supporting
excerpt is also suitable when an in-code collapse adds no teaching value.

## Footnotes

Source: [footnotes](https://codehike.org/docs/code/footnotes).

Use `// !ref Note text` before the relevant line. Collect `ref` annotations in
display order and show their queries in a note list below the code. A `ref`
handler adds the corresponding number to each annotated line.

The upstream example writes a number into each annotation's custom data. For
React rendering, derive new annotations instead of mutating the compiled object.
Validate note numbers before use, or keep the numbering in a typed lookup owned
by the component. Use identifiers scoped to the code block, links from markers
to notes, and return links where useful. Prefer an ordered list with visible
numbers over numbers drawn only with CSS.

Keep notes close to their code. Put essential explanations in the main narrative,
not in a footnote that readers must follow to understand the next step.
