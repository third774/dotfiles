---
name: explorable-explanations
description: Build single-file interactive HTML explanations that teach concepts through experimentation — sliders, animations, step-through controls, and multiple visual representations. Use when the user explicitly asks to build an explorable explanation, interactive explanation, or animated walkthrough of a concept.
---

# Explorable Explanations

Build interactive single-file HTML pages that teach concepts through direct manipulation and experimentation, not passive reading. The reader should develop working intuition by playing with the system, not by being told how it works.

**Core belief:** People learn through experimentation. A slider that lets you *feel* how frequency affects pitch teaches more than a paragraph explaining it.

## Pedagogical Framework

Every explorable MUST follow this structure. The order matters — each layer builds on the previous one.

### 1. Ground the Reader

Start with something concrete and familiar. Before explaining how a hash table works, show a phonebook. Before explaining Fourier transforms, play a sound.

- Open with a visible, interactive element — not a wall of text
- The initial state SHOULD already demonstrate the concept at its simplest
- Use meaningful defaults that teach something on their own
- Signal that the page is interactive — readers often assume static content. A visual cue like an animated down-arrow for scroll-driven explorables, a pulsing "drag me" hint on a draggable element, or a brief intro line ("try moving the slider") helps set the expectation that this is something to play with, not just read

### 2. One Knob at a Time

Introduce complexity incrementally. Each new interactive control SHOULD teach exactly one thing.

- Add one parameter, let the reader explore it fully, then introduce the next
- NEVER present all controls at once — progressive reveal as the reader scrolls or advances
- Label controls with what they *mean*, not what they *are* (e.g., "Pitch" not "Frequency (Hz)" for a first encounter; technical terms come after intuition)

### 3. Tight Feedback Loops

Every input change MUST produce an immediately visible output change.

- Continuous controls (sliders) SHOULD update the visualization in real-time, not on release
- If computation is expensive, show a degraded/simplified preview during interaction and refine on release
- The visual response should feel directly connected to the control — no indirection, no delay

### 4. Multiple Representations

Show the same concept from different angles simultaneously.

- Pair an animation with a graph
- Show both the spatial view and the mathematical view
- Highlight the connection between representations (e.g., a dot on the graph that moves in sync with the animated element)
- Linked representations are the highest-value teaching tool — when you drag a slider and both views update, the relationship clicks

### 5. Let Them Break It

The reader SHOULD be able to push parameters to extremes.

- Edge cases are where intuition solidifies — what happens when frequency is 0? When amplitude is maxed?
- Don't clamp inputs to "safe" ranges unless things genuinely break
- When extremes produce interesting behavior, add a brief annotation explaining why

### 6. Name It Last

Technical terminology SHOULD appear after the reader already has intuition for the concept.

- First: "how far the particle moves" + a slider
- Then: "this property is called *amplitude*"
- The term sticks because it labels something they already understand

## Technical Approach

### Single HTML File with Vue 3

Output MUST be a single `.html` file with no build step. Use Vue 3 via CDN for reactivity/component structure, and Tailwind CSS via CDN for styling.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Explorable: [Topic]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    /* Optional fallback CSS only when Tailwind utilities are insufficient */
  </style>
</head>
<body>
  <div id="app">
    <!-- Template here -->
  </div>
  <script>
    const { createApp, ref, computed, onMounted, onUnmounted, watch } = Vue

    createApp({
      setup() {
        // Reactive state, computed properties, animation loops
        return { /* template bindings */ }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

### Styling: Tailwind CDN First

- Prefer standard Tailwind utility classes for layout, spacing, typography, color, and states.
- Use custom CSS classes in `<style>` only as a fallback when a style cannot be expressed cleanly with available utility classes.
- Keep fallback CSS small and local to the explorable.

**Hard rule:** Tailwind arbitrary values (`[...]`) are NOT available in this single-file HTML + no-build-step + CDN setup and MUST NOT be used.

Reference: https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values

**For very simple explorables** (one or two sliders, no animation), vanilla JS is acceptable. Use Vue when there are multiple reactive controls, animated state, or component-like sections.

### Visualization: SVG vs Canvas

| Use SVG when | Use Canvas when |
|---|---|
| < 500 elements | > 500 elements |
| Need DOM events on individual elements | Need pixel-level control |
| Mostly shapes, lines, text | Particle systems, complex animation |
| Interactivity on individual elements | Performance-critical rendering |

**Default to SVG.** It composes well with Vue's template syntax and handles most explorable needs.

### Animation Loop Pattern

For animated explorables, use `requestAnimationFrame` with elapsed-time-based updates (not frame-counting):

```js
const elapsed = ref(0)
const playing = ref(false)
const speed = ref(1)
let lastTime = null
let frameId = null

function tick(now) {
  if (lastTime != null) {
    elapsed.value += (now - lastTime) * speed.value
  }
  lastTime = now
  frameId = requestAnimationFrame(tick)
}

function togglePlay() {
  if (playing.value) {
    cancelAnimationFrame(frameId)
    lastTime = null
    playing.value = false
  } else {
    playing.value = true
    frameId = requestAnimationFrame(tick)
  }
}

// Step forward one frame (~16ms) while paused
function step() {
  if (!playing.value) {
    elapsed.value += 16 * speed.value
  }
}

onUnmounted(() => cancelAnimationFrame(frameId))
```

### Interpolation for Smooth Transitions

When a discrete parameter change should animate smoothly (e.g., morphing between shapes), use linear interpolation driven by `requestAnimationFrame`:

```js
function lerp(a, b, t) {
  return a + (b - a) * Math.min(1, Math.max(0, t))
}
```

For spring-like smoothing on slider values, apply exponential easing each frame:

```js
// In the animation loop:
displayValue.value += (targetValue.value - displayValue.value) * 0.1
```

## Interactive Control Patterns

### Playback Controls

Animated explorables SHOULD include:

- **Play/Pause toggle**
- **Speed slider** (0.25x to 4x range is reasonable)
- **Step button** (advance one frame while paused)
- **Reset button** (return to initial state)

Group these visually as a "transport bar" — readers recognize this pattern from media players.

### Parameter Controls

- **Sliders** for continuous values — always show the current numeric value alongside
- **Segmented toggles** for discrete choices (e.g., waveform shape: sine / triangle / square)
- **Checkboxes** for toggling layers or annotations on/off

### Scroll-Driven Progression

For long-form explorables that tell a story:

- Pin the visualization and let explanatory text scroll beside it
- Each scroll section introduces one new concept or control
- Use `IntersectionObserver` to trigger state changes as sections enter the viewport

This is the most powerful structure for pedagogical explorables — it enforces the "one knob at a time" principle through the scroll itself.

## Layout and Styling

### Structure

A typical explorable layout:

```
┌──────────────────────────────────┐
│  Title                           │
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │     Visualization          │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ ▶ ⏸  ──●────── 1.0x  ⟳   │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌─────────┐  ┌──────────────┐  │
│  │ Control │  │ Explanatory  │  │
│  │ Panel   │  │ text that    │  │
│  │         │  │ updates with │  │
│  │         │  │ context      │  │
│  └─────────┘  └──────────────┘  │
└──────────────────────────────────┘
```

For scroll-driven explorables, use a two-column layout with sticky visualization:

```
┌──────────────┬───────────────────┐
│              │                   │
│  Scrolling   │  Sticky           │
│  text with   │  visualization    │
│  controls    │  that reacts to   │
│  appearing   │  scroll position  │
│  per section │                   │
│              │                   │
└──────────────┴───────────────────┘
```

### Styling Defaults

- Tailwind utility classes SHOULD be the default styling mechanism
- Use a clear high-contrast palette (dark or light) so the visualization remains legible
- Generous padding around the visualization — it's the centerpiece, give it room
- Controls SHOULD look touchable — rounded corners, visible affordances
- Max-width the content area (~900px) — don't let it sprawl on wide screens
- If Tailwind utilities are insufficient, add a small fallback custom class in `<style>`

## Workflow

When building an explorable explanation:

```
Build Progress:
- [ ] Step 1: Identify the core concept and what intuition the reader should leave with
- [ ] Step 2: Find the simplest possible interactive demonstration of that concept
- [ ] Step 3: Plan the progression — what controls appear and in what order
- [ ] Step 4: Build the base visualization with one interactive parameter
- [ ] Step 5: Layer in additional parameters one at a time
- [ ] Step 6: Add playback controls if animated
- [ ] Step 7: Write bridging text — short, contextual, appears alongside the relevant control
- [ ] Step 8: Test the pedagogical flow — does each step build on the last?
- [ ] Step 9: Polish — smooth transitions, meaningful defaults, edge case behavior
```

## Anti-Patterns

| Pattern | Why it fails |
|---|---|
| Long text intro before any interactivity | Reader disengages before reaching the interesting part |
| All controls visible from the start | Overwhelming; no guided learning path |
| Controls that don't visibly affect anything | Breaks the feedback loop; reader loses trust |
| Technical jargon before intuition | Terms without grounding don't stick |
| Clamping everything to "safe" ranges | Robs the reader of discovering edge cases |
| Tailwind arbitrary value classes (e.g., `w-[37rem]`, `text-[#4a9eff]`) | Not available in single-file CDN/no-build setup; use standard utilities or fallback custom CSS |
| Static diagram where interaction would help | If the reader can't manipulate it, it's not an explorable |

<IMPORTANT>
The goal is intuition, not information transfer. If the reader can recite facts but can't predict what happens when they move a slider, the explorable failed. Every design decision should serve the question: "Will this help the reader build a mental model they can reason with?"
</IMPORTANT>
