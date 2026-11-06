# Choose a code view

For Code Hike 1.1.0. Checked against upstream documentation on 2026-11-05.
These mappings apply to HTML output. Use ordinary Markdown fences in chat.

Sources: [code blocks](https://codehike.org/docs/concepts/code),
[annotations](https://codehike.org/docs/concepts/annotations),
[code examples](https://codehike.org/docs/code).

## Simple views

Code Hike provides `Pre` and annotation APIs, not dedicated tree components.
The named features in its docs are implementation examples to adapt and combine.

| View | Code Hike implementation |
| --- | --- |
| Pseudocode, call tree, or file tree | A `txt` fence; preserve indentation |
| Component tree | A `txt` fence, or `tsx` for valid TSX |
| Fixed point of interest | [Mark](annotations.md#marks) |
| Target that changes with a step | [Focus](annotations.md#focus) |
| Visible note at an entry or expression | [Callout](annotations.md#callouts), or nearby prose if space is limited |
| Prose that refers to a line, branch, or expression | [Code mentions](annotations.md#code-mentions), the default, implemented by the template |
| Changes to source or a simplified structure | [Diff and Mark handlers](changes.md#diffs), or a literal `diff` block |
| Excerpt of a codebase file | A fence with a [source title](#file-names-and-line-numbers): file name and original line numbers |
| Complete target | A fence with a title, and an optional copy control |

Use `txt`, not `text`, for plain fences. In Code Hike 1.1.0, a `text` fence
stops the MDX build with `Cannot destructure property 'length' of 'code'`.

Label trees and pseudocode as simplified views with a descriptive title. Do not
give a sketch a source range; the range adds line numbers that suggest an exact
excerpt.
Do not wrap indentation-based trees if wrapping would obscure their structure;
shorten labels, simplify the tree, or allow horizontal scrolling instead.

Use [Spotlight](layouts.md#spotlight) for independent choices, not just to show a
tree. For related before/after code, default to
[token transitions](changes.md#token-transitions); keep separate panels visible
together only when the comparison requires both.
Use [Slideshow](layouts.md#slideshow) only when explicit step controls help.
Use [Pele](diagrams.md) for rendered diagrams; highlighting Mermaid source in
`Pre` does not render a diagram.

## Structural diffs

Source: [diff](https://codehike.org/docs/code/diff).

A diff can compare file trees, component trees, call trees, or pseudocode. Label
whether it describes an actual change or a proposal. It is not necessarily a
patch that can be applied to source.

For literal `+`/`-` lines, use a `diff` fence rendered by `Pre`. This uses syntax
highlighting, not the annotation handlers. Keep the signs visible and explain
their meaning without relying on color.

For custom signs and line marks, use the Diff and Mark handlers. Annotation
comment syntax depends on the language; the docs do not specify comment syntax
for `text`. Do not assume `// !diff` comments will be removed from a text tree.
Instead, derive a new `HighlightedCode` object with typed block annotations for
the intended line ranges. Check the installed types, preserve the compiled
tokens, and do not mutate the shared object or use type assertions. A literal
diff is sufficient when custom annotations add no value.

## File names and line numbers

Sources: [file name](https://codehike.org/docs/code/filename),
[line numbers](https://codehike.org/docs/code/line-numbers).

The template's `src/code.tsx` reads the fence metadata, the text after the
language, and renders one of three forms:

| Metadata | Result |
| --- | --- |
| `src/store.ts:40-52` or `src/store.ts:40` | Source excerpt: the file name, the line range, and a gutter with the original line numbers |
| `src/store.ts:40-52 before (a1b2c3d)` | Source excerpt with a label for the revision or side |
| `Proposed call tree` | Title only, with no line numbers |
| Nothing | No title and no line numbers |

````mdx
```ts src/store.ts:40-43
export function save(value: Value) {
  if (!value.id) throw new MissingId()
  return db.insert(value)
}
```
````

Every excerpt of a codebase file must use the source form. Use the path relative
to the repository root. The range counts the excerpt's lines after annotation
comments are removed, so `// !mention` lines do not count. A range that does not
match the line count, or that is not valid, replaces the block with an error
message and logs a console error. Treat it as failed verification and correct
the range or the excerpt; do not remove the range to hide the error.

Keep each excerpt contiguous. To show two separate regions of a file, use two
blocks, each with its own range. Do not join them with an omission comment.
Proposed code and sketches get a descriptive title, not a source range. If the
proposal names a new file, say so in the title, such as `New file: src/retry.ts`.

The gutter numbers cannot be selected or copied. Custom layouts, such as tabs
or a scrollycoding panel, must render each code block with the `CodeBlock`
component from `src/code.tsx` so that they apply the same rules.

## Copyable targets

Source: [copy button](https://codehike.org/docs/code/copy-button).

Show the whole target when most of it is new, omitted context would hide order
or ownership, or the reader needs to copy it. Do not add tabs or animation just
to display a complete block.

The copy-button example copies `highlighted.code`, not the rendered DOM. For a
target, copy the complete target without annotation comments, diff signs, or
omission markers. Label whether a comparison control copies the old version,
new version, or displayed comparison. Do not present a structural sketch as
ready-to-run code.

Await `navigator.clipboard.writeText` and report success only after it resolves.
Handle unavailable APIs and rejected writes. Keep the text selectable as a
manual-copy fallback, and test the control through `file://`. Do not copy the
upstream example's immediate success state without error handling.
