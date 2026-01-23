# Built-in Components

Use directly in slides without imports.

## Click Animation Components

See `animations.md` for full details.

### `<v-click>`

Show content on click:

```md
<v-click>Appears after 1 click</v-click>
<v-click>Appears after 2 clicks</v-click>
```

### `<v-clicks>`

Apply `v-click` to all children:

```md
<v-clicks>

- Item 1 (click 1)
- Item 2 (click 2)
- Item 3 (click 3)

</v-clicks>
```

Props:
- `depth` - Handle nested lists: `<v-clicks depth="2">`
- `every` - Items per click: `<v-clicks every="2">`

### `<v-after>`

Show with previous `v-click` (same click count):

```md
<v-click>Hello</v-click>
<v-after>World</v-after>  <!-- Both appear on same click -->
```

### `<v-switch>`

Show different content at different click counts:

```md
<v-switch>
  <template #1>Shown at click 1</template>
  <template #2>Shown at click 2</template>
  <template #5-7>Shown at clicks 5, 6</template>
</v-switch>
```

## Drawing & Positioning

### `<Arrow>`

Draw arrow between coordinates:

```md
<Arrow x1="10" y1="20" x2="100" y2="200" />
```

Props:
- `x1`, `y1` - Start point (required)
- `x2`, `y2` - End point (required)
- `width` - Line width (default: `2`)
- `color` - Line color (default: `currentColor`)
- `two-way` - Bidirectional arrow (default: `false`)

### `<VDragArrow>`

Draggable arrow. Same props as `<Arrow>`, position persists.

### `<VDrag>`

Make any content draggable:

```md
<VDrag>
  Drag me around!
</VDrag>
```

### `<Transform>`

Scale or transform content:

```md
<Transform :scale="0.5" origin="top center">
  <LargeContent />
</Transform>
```

Props:
- `scale` - Transform scale (default: `1`)
- `origin` - Transform origin (default: `top left`)

## Media

### `<SlidevVideo>`

Embed video with click integration:

```md
<SlidevVideo v-click autoplay controls>
  <source src="/video.mp4" type="video/mp4" />
  <source src="/video.webm" type="video/webm" />
</SlidevVideo>
```

Props:
- `controls` - Show controls (default: `false`)
- `autoplay` - Auto-start: `true`, `'once'`, `false`
- `autoreset` - Reset on: `'slide'` or `'click'`
- `poster` - Poster image URL
- `timestamp` - Start time in seconds

### `<Youtube>`

Embed YouTube video:

```md
<Youtube id="luoMHjh-XcQ" />
<Youtube id="luoMHjh-XcQ?start=120" />  <!-- Start at 2:00 -->
```

Props:
- `id` - YouTube video ID (required)
- `width`, `height` - Dimensions

### `<Tweet>`

Embed tweet:

```md
<Tweet id="1234567890" />
```

Props:
- `id` - Tweet ID (required)
- `scale` - Transform scale
- `cards` - `'visible'` or `'hidden'`

## Navigation & Structure

### `<Link>`

Navigate to another slide:

```md
<Link to="42">Go to slide 42</Link>
<Link to="42" title="Go to slide 42" />
<Link to="solutions" title="Jump to solutions" />  <!-- Using routeAlias -->
```

### `<Toc>`

Table of contents:

```md
<Toc />
<Toc :columns="2" />
<Toc maxDepth="2" minDepth="1" />
<Toc mode="onlyCurrentTree" />
```

Props:
- `columns` - Number of columns (default: `1`)
- `maxDepth` - Max heading depth (default: `Infinity`)
- `minDepth` - Min heading depth (default: `1`)
- `mode` - `'all'`, `'onlyCurrentTree'`, `'onlySiblings'`

Hide slide from ToC:

```md
---
hideInToc: true
---
```

### `<SlideCurrentNo>` / `<SlidesTotal>`

```md
Slide <SlideCurrentNo /> of <SlidesTotal />
```

## Utility

### `<LightOrDark>`

Conditional content based on theme:

```md
<LightOrDark>
  <template #dark>Dark mode content</template>
  <template #light>Light mode content</template>
</LightOrDark>
```

### `<RenderWhen>`

Conditional rendering by context:

```md
<RenderWhen context="presenter">
  Only visible in presenter view.
</RenderWhen>
```

Contexts: `'slide'`, `'presenter'`, `'overview'`, `'print'`, `'previewNext'`

### `<AutoFitText>`

Auto-sizing text box:

```md
<AutoFitText :max="200" :min="100" modelValue="Text that fits" />
```

### `<PoweredBySlidev>`

"Powered by Slidev" attribution link.
