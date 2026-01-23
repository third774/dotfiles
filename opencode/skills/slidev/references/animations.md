# Animations

## Click Animations

A "click" is one animation step. Press next/space to advance.

### `v-click` Directive

```md
<div v-click>Appears after 1 click</div>
<div v-click>Appears after 2 clicks</div>
```

### `v-after` Directive

Same click as previous element:

```md
<div v-click>Hello</div>
<div v-after>World</div>  <!-- Both appear together -->
```

### Hide on Click

`.hide` modifier hides instead of shows:

```md
<div v-click>Shows on click 1</div>
<div v-click.hide>Hides on click 2</div>
<div v-after.hide>Also hides on click 2</div>
```

### Click Positioning

#### Relative (default)

Relative to previous element. Use string with `+` or `-`:

```md
<div v-click>Click 1</div>
<div v-click="'+2'">Click 3 (skips 2)</div>
<div v-click="'+0'">Same as v-after</div>
```

#### Absolute

Exact click number. Use number or string without `+/-`:

```md
<div v-click="3">Shows at click 3</div>
<div v-click="1">Shows at click 1</div>
```

#### Mixed

```md
<div v-click>Click 1</div>
<div v-click="3">Click 3</div>
<div v-click>Click 2 (fills gap)</div>
```

### Enter & Leave Ranges

Show only during specific clicks using `[enter, leave]`:

```md
<div v-click="[2, 4]">Visible at clicks 2 and 3, hidden at 4+</div>
```

### `v-clicks` Component

Apply to list items:

```md
<v-clicks>

- Item 1
- Item 2
- Item 3

</v-clicks>
```

Nested lists with `depth`:

```md
<v-clicks depth="2">

- Parent 1
  - Child 1.1
  - Child 1.2
- Parent 2

</v-clicks>
```

Multiple items per click with `every`:

```md
<v-clicks every="2">

- Row 1 Col 1
- Row 1 Col 2
- Row 2 Col 1
- Row 2 Col 2

</v-clicks>
```

### `v-switch` Component

Different content at different clicks:

```md
<v-switch>
  <template #1>Step 1 content</template>
  <template #2>Step 2 content</template>
  <template #3-5>Steps 3-4 content</template>
</v-switch>
```

### Code Block Clicks

```md
```ts {1|3|5-7}     // Line 1, then 3, then 5-7
```ts {*|1|3}       // All, then 1, then 3
```ts {1|3}{at:5}   // Start at click 5
```

### Custom Click Count

Override auto-calculated clicks:

```md
---
clicks: 10
---
```

## Slide Transitions

Set in headmatter (all slides) or per-slide frontmatter:

```md
---
transition: slide-left
---
```

### Built-in Transitions

| Transition | Effect |
|------------|--------|
| `fade` | Crossfade |
| `fade-out` | Fade out, then fade in |
| `slide-left` | Slide left (right when back) |
| `slide-right` | Slide right (left when back) |
| `slide-up` | Slide up (down when back) |
| `slide-down` | Slide down (up when back) |
| `view-transition` | View Transitions API |

### Directional Transitions

Different transition for forward/backward:

```md
---
transition: slide-left | slide-right
---
```

### Custom Transitions

Define in CSS using Vue transition classes:

```css
.my-transition-enter-active,
.my-transition-leave-active {
  transition: opacity 0.5s ease;
}
.my-transition-enter-from,
.my-transition-leave-to {
  opacity: 0;
}
```

```md
---
transition: my-transition
---
```

## Element Motion

`v-motion` directive from `@vueuse/motion`:

```md
<div
  v-motion
  :initial="{ x: -80, opacity: 0 }"
  :enter="{ x: 0, opacity: 1 }"
  :leave="{ x: 80, opacity: 0 }"
>
  Animated element
</div>
```

### Motion with Clicks

```md
<div
  v-motion
  :initial="{ x: -80 }"
  :enter="{ x: 0, y: 0 }"
  :click-1="{ y: 30 }"
  :click-2="{ y: 60 }"
  :leave="{ x: 80 }"
>
  Click-driven animation
</div>
```

Variants:
- `initial` - Before entering slide
- `enter` - On slide enter
- `click-N` - At click N
- `click-N-M` - From click N to M-1
- `leave` - On slide leave

### Combined with v-click

```md
<div v-click="[2, 4]" v-motion
  :initial="{ x: -50 }"
  :enter="{ x: 0 }"
  :leave="{ x: 50 }"
>
  Shown at click 2, hidden at 4, with motion.
</div>
```

## Styling Click Animations

Default uses opacity transition. Customize:

```css
.slidev-vclick-target {
  transition: all 500ms ease;
}

.slidev-vclick-hidden {
  transform: scale(0);
  opacity: 0;
}
```

Per-slide or per-layout:

```css
.slidev-page-7 .slidev-vclick-hidden {
  transform: translateY(20px);
}
```
