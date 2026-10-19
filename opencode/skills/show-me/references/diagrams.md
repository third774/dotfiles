# Mermaid diagrams with Pele

For Pele 1.6.0, the template's pinned version. Checked against upstream
documentation on 2026-10-17.

Sources: [API](https://pele.run/api), [theming](https://pele.run/theming),
[compatibility](https://pele.run/compatibility), [security](https://pele.run/security).

## When to use a diagram

Use a diagram when relationships are easier to see than to describe: module
boundaries, data flow, a request sequence, or state changes. Keep the diagram
small and place it next to the code and prose it supports. Use names from the
source. Identify omitted paths and inferred relationships. A diagram does not
replace the code evidence for a behavior claim.

Pele renders Mermaid syntax with its own layout engine. It is not Mermaid.js.
Layout and configuration support differ; Mermaid themes and `themeVariables`
do not apply. Check the pinned version before using syntax from newer docs.

## Use the template's React wrapper

`src/diagram.tsx` exports `Diagram`, which is registered for MDX in `src/main.tsx`.
Pass Mermaid text, a visible title, and a plain-text explanation of the important
relationships. For example, in the copied app's MDX:

```mdx
<Diagram
  title="Request path"
  description="The handler validates the input before it calls the store. Invalid input returns an error without a store call."
  source={`flowchart TD
    accTitle: Request path
    accDescr: Valid input reaches the store. Invalid input returns an error.
    A[Handler] --> B{Valid input?}
    B -->|Yes| C[Store]
    B -->|No| D[Error]`}
/>
```

This is a usage example, not a required narrative or layout. Use `accTitle` and
`accDescr` in the Mermaid source so the SVG has its own accessible name and
description. Keep essential information in visible prose, not only in the SVG.
The wrapper also provides an optional source disclosure as escaped React text.

## React ownership and lifecycle

- Import `mount` from `pele`, not a CDN or the asynchronous lazy entry point.
  The bundler includes the renderer in the offline HTML file.
- React owns the figure, caption, prose, and source disclosure. Pele owns only
  the empty `div` reached through a ref. Do not put React children inside it or
  insert generated SVG during React rendering.
- The effect mounts the source with a unique `useId()` prefix. This prevents
  accessibility ID collisions between diagrams on the same page.
- Pele measures the container, observes width changes, and handles pending
  fonts. Use a container whose width does not depend on the SVG. The wrapper's
  CSS supplies this boundary and allows horizontal overflow when needed.
- A source change destroys the previous mount and creates a new one. This
  resets zoom and prevents an old diagram from remaining beside new prose.
  Cleanup calls `destroy()` and clears the container because `destroy()` leaves
  the SVG in place. This also supports React Strict Mode's effect cleanup cycle.
- Pele displays parse and render errors as text in the container. Treat an
  error display as a failed verification, not as a finished diagram. Keep
  errors out of raw HTML; their messages can contain source text.
- Automatic zoom includes buttons and keyboard controls. Check focus, `+`, `-`,
  `0`, and arrow keys when zoom is available. Do not add animation by default.

Keep this wrapper small. Do not expose arbitrary render options, icon markup,
or navigation handlers to diagram content. If an existing destination uses a
different component structure, preserve these ownership and cleanup rules.

## Offline use and styling

The wrapper disables links and images. Images can trigger network requests;
relative image URLs also break a single-file artifact. Put reference links in
React or MDX prose instead. Do not add external icon loaders or font requests.
Keep Pele's source, output, and edge limits enabled.

`src/diagram.css` contains only component rules. Set Pele's color variables on
`.explain-diagram` in the copied app's styles to match its background and text:
`--pele-bg`, `--pele-fg`, `--pele-muted`, `--pele-line`, `--pele-surface`,
`--pele-surface-alt`, `--pele-border`, and `--pele-accent`. Check contrast for
each theme. Prefer these variables to fixed colors in Mermaid source.

The wrapper sets system font variables before mounting, so measurement and
display use the same fonts. If controls later change fonts, call `refresh()` on
the active mount or remount it. Color-variable changes do not need a new render.

## Verify

Test the built file offline at desktop and mobile widths. Check readable labels,
arrow direction, container resizing, multiple diagrams, error text, source
changes, zoom, keyboard use, and unmount cleanup. Some layouts change direction
at narrow widths; confirm that the meaning stays correct. Inspect screenshots,
not only SVG presence. Do not shrink text to make a large diagram fit; simplify
it, split it, or use the available zoom and overflow controls.
