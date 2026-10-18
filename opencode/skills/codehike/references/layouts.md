# Narrative layouts

For Code Hike 1.1.0. Checked against upstream documentation on 2026-10-15.
Layouts are React compositions, not built-in `Pre` modes. Select a layout only
after deciding the teaching order. Do not install a UI framework just to copy
the appearance of a documentation example.

## Content and state

Source: [blocks](https://codehike.org/docs/concepts/blocks).

Code Hike can turn decorated MDX into structured component props:

- `## !step Title` makes a named block with `title` and `children`.
- Repeated `## !!steps Title` headings form a `steps` array.
- A code fence with `!code` stores a named code block; `!!tabs` collects an array.
- Heading levels determine nesting. The structure can occur inside a custom
  MDX component or at the root of the document.

When using this mechanism, parse unknown props with `parseProps`, or root content
with `parseRoot`, from `codehike/blocks`. The docs combine `Block` and `CodeBlock`
schemas with Zod. Add and verify compatible dependencies only if needed. Do not
assume that a raw `CodeBlock` schema describes build-highlighted code; match the
schema to the compilation settings and the installed package's exports.

Alternatively, compose custom React components directly in MDX. Keep highlighted
code compiled at build time in either approach. Model each step as one unit
containing its label, prose, code, and source reference. Do not synchronize
separate prose and code arrays by unchecked numeric indices. Validate that the
sequence is nonempty before rendering a selected step.

For a code explanation, a selection must expose its supporting code as well as
its prose. A changing citation below changing text is not enough. Reuse one
excerpt when its targets remain clear; otherwise select the relevant excerpt
with the explanation. A static table is often better than controls that merely
hide short descriptions.

Plan the narrow-screen reading order separately. Keep the selected explanation
and a short matching excerpt together. Do not require readers to scroll past a
long control list, remember the explanation, then search a large code panel.
The complete source can remain available separately. Do not automatically move
keyboard focus or scroll the page away from the control to compensate.

## Scrollycoding

Source: [scrollycoding](https://codehike.org/docs/layouts/scrollycoding).

Use this for a sequence where each step builds on the previous step: execution,
data movement, state changes, or a lifecycle.

Implementation pattern:

1. Render narrative sections in teaching order beside a sticky code panel.
2. Observe the narrative sections with `IntersectionObserver`. Select the step
   nearest a defined reading position; do not let callback order decide the step
   when several sections are visible.
3. Show that step's compiled code and focus annotations in the panel. Keep the
   panel mounted if token transitions must compare its old and new DOM.
4. Disconnect the observer on cleanup. Initialize the first step so content is
   present before observation starts.
5. Provide direct step controls or anchors. Check forward and backward scrolling,
   jumping to a section, and a section taller than the viewport.

Keep the code panel below the available viewport height and allow its own
overflow. At narrow widths, use normal document flow or place code with each
section. Do not leave the reader with prose whose matching code is inaccessible.
Scrolling must not move keyboard focus or require animation to understand a step.

## Spotlight

Source: [spotlight](https://codehike.org/docs/layouts/spotlight).

Use this when readers can choose independent topics or inspect several aspects
of the same mechanism. Render labelled controls beside a code panel. Each control
selects the related explanation, excerpt, and annotations as one state update.

Use real buttons and show which topic is selected, or implement full tab
semantics when it is a tab interface. Keep essential context visible. Do not use
spotlight when understanding the next topic requires reading every prior topic
unless the required order is also clear.

## Tabs

Source: [tabs](https://codehike.org/docs/code/tabs).

Use tabs for related files or alternative implementations, not to hide the main
teaching sequence. The upstream MDX pattern puts fences marked `!!tabs filename`
inside a custom `CodeWithTabs` component. Fence metadata supplies the labels.
The docs use shadcn/ui, but it is not a Code Hike requirement.

For the single-file app, supply compiled highlighted code to the tab panels.
Do not run the upstream async highlighting example during browser rendering.
Use stable, unique identifiers rather than assuming file labels are unique.

Use an existing accessible tab component, or implement `tablist`, `tab`, and
`tabpanel` roles with `aria-selected`, linked control/panel IDs, roving tab focus,
and arrow-key navigation. Only the active panel should be available to keyboard
and screen-reader navigation. If that behavior is not needed, use ordinary
labelled buttons with a clearly identified selected panel instead of partial tab
semantics. Verify that long file names remain usable on narrow screens.
