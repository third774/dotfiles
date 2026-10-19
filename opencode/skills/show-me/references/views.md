# Choose a code view

For Code Hike 1.1.0. Checked against upstream documentation on 2026-10-19.
These mappings apply to HTML output. Use ordinary Markdown fences in chat.

Sources: [code blocks](https://codehike.org/docs/concepts/code),
[annotations](https://codehike.org/docs/concepts/annotations),
[code examples](https://codehike.org/docs/code).

## Simple views

Code Hike provides `Pre` and annotation APIs, not dedicated tree components.
The named features in its docs are implementation examples to adapt and combine.

| View | Code Hike implementation |
| --- | --- |
| Pseudocode, call tree, or file tree | `Pre` with language `text`; preserve indentation |
| Component tree | `Pre` with `text`, or `tsx` for valid TSX |
| Fixed point of interest | [Mark](annotations.md#marks) |
| Target that changes with a step | [Focus](annotations.md#focus) |
| Visible note at an entry or expression | [Callout](annotations.md#callouts), or nearby prose if space is limited |
| Prose that selects a code target | [Code mentions](annotations.md#code-mentions), with keyboard and touch support |
| Changes to source or a simplified structure | [Diff and Mark handlers](changes.md#diffs), or a literal `diff` block |
| Complete target | Plain `Pre`, with a title and optional copy control |

Label trees and pseudocode as simplified views. Do not give a sketch source-line
numbers that suggest it is an exact excerpt. Keep source references separate.
Do not wrap indentation-based trees if wrapping would obscure their structure;
shorten labels, simplify the tree, or allow horizontal scrolling instead.

Use [Spotlight](layouts.md#spotlight) for independent choices, not just to show a
tree. Keep before/after panels visible together when comparison requires both.
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

## Titles and copyable targets

Sources: [file name](https://codehike.org/docs/code/filename),
[copy button](https://codehike.org/docs/code/copy-button).

The file-name example renders `codeblock.meta` in a wrapper beside `Pre`.
Use that pattern for a source path or a descriptive title such as
"Proposed call tree". Do not imply that a sketch is a real file.

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
