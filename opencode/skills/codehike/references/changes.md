# Showing changes

For Code Hike 1.1.0. Checked against upstream documentation on 2026-10-15.
Neither a diff handler nor token animation explains why a change matters. Pair
the visual comparison with the resulting behavior and its source evidence.

## Diffs

Source: [diff](https://codehike.org/docs/code/diff).

Use `// !diff -` before a removed line and `// !diff +` before an added line.
Use explicit ranges for multiple lines. These are annotations in the excerpt's
language, not a raw unified diff passed to a syntax highlighter.

Use diffs selectively when the claim depends on which lines changed, such as new
allowlist entries or verification options. Do not make readers compare an entire
unmarked list from memory. For a change between different structures, labelled
before/after excerpts can be clearer. Do not force every section into diff form.

The upstream implementation composes two handlers:

1. A `diff` handler transforms each block annotation into the original annotation
   plus a `mark` annotation with a removal or addition color.
2. Its line rendering adds the `annotation.query` sign beside the code.
3. The `mark` handler adds the corresponding line background and border.
4. Both handlers are passed to `Pre`.

Accept only `+` or `-` for the diff meaning. Use an explicit sign or accessible
text label, not color alone. Keep sign placement separate from indentation and
code text. If copying is available, make clear whether it copies the old code,
the new code, or the displayed comparison.

Build excerpts from the actual comparison. Include enough unchanged context to
locate the change, and label original paths, revisions, and line ranges for each
side. Reordering or combining excerpts must not suggest that unrelated lines
were adjacent. Use separate before/after panels when an interleaved comparison
would obscure control flow.

## Token transitions

Source: [token transitions](https://codehike.org/docs/code/token-transitions).

Use token movement when readers need to track what stays the same as code
changes. Do not use it merely because a code panel changes. A transition between
two excerpts is not evidence that Git identifies them as corresponding changes.

The upstream pattern uses these exports from `codehike/utils/token-transitions`:

- `getStartingSnapshot` captures the old code panel before the DOM update.
- `calculateTransitions` compares the updated panel with that snapshot.
- `TokenTransitionsSnapshot` describes the captured state.

It uses a class component with `getSnapshotBeforeUpdate` and `componentDidUpdate`
to capture before and measure after React's DOM update. The wrapper renders
`InnerPre`, gets its element through `getPreRef`, and is registered as the
handler's `PreWithRef`. A `Token` handler renders `InnerToken` with
`display: "inline-block"`. The resulting transitions are applied with the Web
Animations API. Retain the same panel instance across steps.

The upstream example contains non-null assertions and unsafe keyframe casts.
Do not copy these. Check the element reference before capture or measurement,
represent a missing snapshot explicitly, and use the installed utility's types
to validate keyframes. If browser compatibility needs translation conversion,
handle the actual typed properties rather than casting to an arbitrary object.

Skip animation for the initial render and for `prefers-reduced-motion: reduce`.
Cancel active animations before starting another transition and on unmount.
Test rapid step changes, changed line counts, overflow, and narrow screens. If
the utility cannot be integrated safely, use an immediate code change; correct,
readable code is more important than animation.
