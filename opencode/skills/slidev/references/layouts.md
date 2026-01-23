# Built-in Layouts

Set layout via frontmatter:

```md
---
layout: center
---
```

## Content Layouts

### `default`

Basic layout. Content flows normally. Used when no layout specified.

### `center`

Centers content horizontally and vertically.

```md
---
layout: center
class: text-center
---

# Centered Title

Centered paragraph.
```

### `cover`

Title/cover slide. Typically first slide.

### `intro`

Introduction slide. Author info, presentation context.

### `end`

Final slide. "Thank you", contact info.

### `section`

Section divider. Marks beginning of new topic.

### `statement`

Single statement with prominence.

### `fact`

Highlight a fact or statistic prominently.

### `quote`

Display quotation with attribution.

### `full`

Content uses full screen. No padding.

### `none`

No styling. Bare slide.

## Two-Column Layouts

### `two-cols`

Split content left/right using `::right::` separator:

```md
---
layout: two-cols
---

# Left Column

Content on left side.

::right::

# Right Column

Content on right side.
```

### `two-cols-header`

Header spans both columns, then splits:

```md
---
layout: two-cols-header
---

# Header Across Both

::left::

Left content.

::right::

Right content.
```

## Image Layouts

### `image`

Full-slide background image:

```md
---
layout: image
image: /path/to/image.png
backgroundSize: cover
---
```

`backgroundSize`: `cover` (default), `contain`, or CSS value like `20em 70%`.

### `image-left`

Image on left, content on right:

```md
---
layout: image-left
image: /photo.jpg
class: my-content-class
---

# Title

Content appears on right side.
```

### `image-right`

Image on right, content on left:

```md
---
layout: image-right
image: /photo.jpg
---

# Title

Content appears on left side.
```

## Iframe Layouts

### `iframe`

Embed webpage as full slide:

```md
---
layout: iframe
url: https://sli.dev
---
```

### `iframe-left`

Iframe on left, content on right:

```md
---
layout: iframe-left
url: https://github.com/slidevjs/slidev
class: my-content-class
---

# About This Project

Description on the right.
```

### `iframe-right`

Iframe on right, content on left:

```md
---
layout: iframe-right
url: https://github.com/slidevjs/slidev
---

# About This Project

Description on the left.
```

## Layout Summary

| Layout | Purpose |
|--------|---------|
| `default` | Standard content slide |
| `center` | Centered content |
| `cover` | Title/cover page |
| `intro` | Introduction |
| `end` | Final slide |
| `section` | Section divider |
| `statement` | Prominent statement |
| `fact` | Highlight fact/stat |
| `quote` | Quotation display |
| `full` | Full-bleed content |
| `none` | Unstyled |
| `two-cols` | Two columns |
| `two-cols-header` | Header + two columns |
| `image` | Background image |
| `image-left` | Image left, content right |
| `image-right` | Image right, content left |
| `iframe` | Full iframe |
| `iframe-left` | Iframe left, content right |
| `iframe-right` | Iframe right, content left |

Themes MAY provide additional layouts or override these.
