# Review the reader's experience

Use the built HTML through `file://`. This review is separate from type checks,
build checks, and source verification. Do not approve the presentation from its
source code, DOM snapshot, or a previous agent's screenshots alone.

## Capture and inspect

1. Use a dedicated browser session. At normal browser zoom, test a desktop
   viewport and a narrow mobile viewport, for example 1440 × 1000 and 390 × 844.
2. Capture fresh viewport screenshots of the opening, the densest code or
   comparison, and each distinct interaction layout. For changing code or focus,
   include states with targets near the start and end of the excerpt. A full-page
   image can show overall structure but does not replace viewport images.
3. Wait for scrolling and transitions to finish before capture. Open the images
   with an image-capable tool and inspect them. Saving screenshots alone is not
   a visual review.
4. Use every control and disclosure. Check keyboard activation, visible focus,
   backward navigation, and reduced motion. Inspect screenshots of changed states
   where layout or evidence changes. DOM measurements can help locate overflow,
   but do not replace checking what a reader can see.

## Acceptance checks

- **Evidence:** Can the reader locate the expression or branch that proves the
  visible claim? Does each selected explanation show its matching evidence?
  Check called-function behavior at its implementation, not only its call site.
- **Attention:** Does a mark distinguish a useful target within its excerpt?
  Remove broad marks that add no guidance. Keep unrelated failure branches out
  of successful-path selections.
- **Readability:** Can the reader read the important expressions without zooming
  or repeated horizontal scrolling? Check long types, conditions, and comments.
  Use word wrap, shorter excerpts, or more width rather than smaller text.
- **Proximity:** Can the reader connect prose and code without repeatedly moving
  between them? On mobile, keep selected prose and its short excerpt adjacent.
  Do not make users operate both page scrolling and a large nested code viewport
  just to understand one step.
- **Comparison:** Are both sides readable when simultaneous comparison matters?
  Do not hide them behind tabs just to save space. Distinguish additions and
  removals when the explanation depends on them, with signs or labels as well
  as color.
- **Value of interaction:** Does each control make a relationship easier to see?
  If it only hides a few sentences, consider a static table or list. Use movement
  only when tracking continuity matters. Do not add features to meet a quota.
- **Reading order:** Is the main path clear, with supporting evidence and source
  metadata available without interrupting every idea? Keep essential rules and
  limits in the main path rather than behind hover or optional disclosures.

## Correct and report

Correct failed checks, rebuild, and capture the affected states again. Recheck
annotation ranges after excerpt changes. Keep screenshots beside the temporary
app, outside `dist/`, so the output remains one HTML file. Include representative
screenshot paths in the completion report.

If browser or image inspection tools are unavailable, state exactly which checks
could not be done. Do not describe an uninspected layout as visually verified.
Close the browser session and any verification processes that you started.
