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

## Linking diagram nodes to explanations

When a diagram is paired with companion explanation tiles, cards, or step notes,
link them with `DiagramScope` and `DiagramTarget` from `src/diagram.tsx` (both
are registered for MDX in `src/main.tsx`).

```mdx
<DiagramScope>

<Diagram
  title="Service dependencies"
  description="Arrows show dependencies, not execution order."
  source={`flowchart TD
    accTitle: Service dependencies
    accDescr: LoginSessions depends on LoginSessionStore and RegistryTokens.
    LoginSessions[LoginSessions · NEW]:::new --> LoginSessionStore[LoginSessionStore · NEW]:::new
    LoginSessions --> RegistryTokens[RegistryTokens · CHANGED]:::changed
    RegistryTokens --> RegistryTokenStore[RegistryTokenStore · CHANGED]:::changed
    classDef new fill:#edf7f0,stroke:#2d6a4f
    classDef changed fill:#fdf3e7,stroke:#b45309`}
/>

<div className="tiles">
  <DiagramTarget nodes="LoginSessions" className="tile">
    <span className="badge">NEW</span>
    <h3>LoginSessions</h3>
    <p>Coordinates session lifecycle and delegates token issuance.</p>
  </DiagramTarget>

  <DiagramTarget nodes={["RegistryTokens", "RegistryTokenStore"]} className="tile">
    <span className="badge">CHANGED</span>
    <h3>RegistryTokens + store</h3>
    <p>Adds login-specific token issuance in a single database batch.</p>
  </DiagramTarget>
</div>

</DiagramScope>
```

How linking works:

- Pass a single Mermaid node (or subgraph/cluster) ID as `nodes="NodeId"` or a
  list of IDs as `nodes={["NodeA", "NodeB"]}` to `<DiagramTarget>`. Multiple
  targets may also reference the same node ID (for example, a shared service
  involved in several flow steps).
- Hovering or keyboard-focusing a linked diagram node highlights that node and
  every matching `<DiagramTarget>`, while dimming unrelated targets and diagram
  nodes. Hovering or focusing a `<DiagramTarget>` highlights that target and
  every diagram node in its `nodes` list, dimming the rest.
- Clicking a linked node or target (or pressing Enter or Space when focused)
  pins the selection; activating it again or pressing Escape clears it. Links
  and buttons inside a `<DiagramTarget>` still work normally without toggling
  the pin.
- Diagram nodes not referenced by any `<DiagramTarget>` stay non-interactive so
  contextual nodes (such as entry routes or databases explained elsewhere) do
  not dim unrelated tiles on hover.
- `<DiagramScope>` cannot nest, and `<DiagramTarget>` must be inside a
  `<DiagramScope>`. The scope logs a console error if a `<DiagramTarget>`
  references a node ID that is missing from every `<Diagram>` in the scope.
  Treat these errors as failed verification.
- Keep all explanation text visible without interaction; linking adds visual
  correspondence, not hidden content.
- To customize highlight and dim styles in `src/styles.css`, set
  `--diagram-highlight-border`, `--diagram-highlight-shadow`,
  `--diagram-dim-opacity`, and `--diagram-edge-dim-opacity` on `.diagram-scope`.

## Offline use and styling

The wrapper disables links and images. Images can trigger network requests;
relative image URLs also break a single-file artifact. Put reference links in
React or MDX prose instead. Do not add external icon loaders or font requests.
Keep Pele's source, output, and edge limits enabled.

`src/diagram.css` contains only component rules. Set Pele's color variables on
`.explain-diagram` in the copied app's styles to match its background and text:
`--pele-bg`, `--pele-fg`, `--pele-muted`, `--pele-line`, `--pele-surface`,
`--pele-surface-alt`, `--pele-border`, and `--pele-accent`. Check contrast for
each theme. Prefer these variables to fixed colors in Mermaid source. When a
change diagram uses Mermaid `classDef` fills and strokes to distinguish status
(`NEW`, `CHANGED`, `EXISTING`, `REMOVED`), pair them with explicit status text
in the node labels and a visible legend, and check label contrast against each
fill.

The wrapper sets system font variables before mounting, so measurement and
display use the same fonts. If controls later change fonts, call `refresh()` on
the active mount or remount it. Color-variable changes do not need a new render.

## Verify

Test the built file offline at desktop and mobile widths. Check readable labels,
arrow direction, container resizing, multiple diagrams, error text, source
changes, zoom, keyboard use, and unmount cleanup. When using `<DiagramScope>`,
verify hovering, focusing, pinning, and clearing with Escape from both diagram
nodes and `<DiagramTarget>` items, and confirm there are no console errors for
unmatched node IDs. Some layouts change direction at narrow widths; confirm that
the meaning stays correct. Inspect screenshots, not only SVG presence. Do not
shrink text to make a large diagram fit; simplify it, split it, or use the
available zoom and overflow controls.
