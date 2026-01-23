# Themes and Addons

## Using Themes

Set in headmatter:

```yaml
---
theme: seriph
---
```

Theme resolves to npm package `slidev-theme-{name}` or `@slidev/theme-{name}`.

### Popular Themes

| Theme | Style |
|-------|-------|
| `default` | Minimal, clean |
| `seriph` | Professional, serif fonts |
| `apple-basic` | Apple keynote style |
| `bricks` | Colorful blocks |
| `shibainu` | Playful |
| `dracula` | Dark, Dracula colors |

Browse all: https://sli.dev/resources/theme-gallery

### Installing Themes

Themes auto-install on first run. Or manually:

```bash
pnpm add slidev-theme-seriph
```

### Theme Config

Themes expose customization via `themeConfig`:

```yaml
---
theme: seriph
themeConfig:
  primary: '#5d8392'
  secondary: '#6366f1'
---
```

Check theme docs for available options.

### Ejecting Theme

Copy theme files locally for full customization:

```bash
slidev theme eject
slidev theme eject --dir my-theme  # Custom output dir
```

Creates theme files in project. Edit freely.

## Using Addons

Addons extend Slidev with components, layouts, or features.

```yaml
---
addons:
  - slidev-addon-citations
  - '@katzumi/slidev-addon-qrcode'
---
```

### Installing Addons

```bash
pnpm add slidev-addon-qrcode
```

Browse addons: https://sli.dev/resources/addon-gallery

### Addon vs Theme

| Aspect | Theme | Addon |
|--------|-------|-------|
| Purpose | Visual styling | Features/components |
| Quantity | One per deck | Multiple allowed |
| Provides | Layouts, styles, fonts | Components, utilities |

## Local Theme

Create `theme` directory in project root:

```
my-slides/
├── slides.md
└── theme/
    ├── styles/
    │   └── index.css
    ├── layouts/
    │   └── my-layout.vue
    └── components/
        └── MyComponent.vue
```

No need to specify in headmatter; auto-detected.

## Overriding Theme

### Override Layouts

Create `layouts/` in project root:

```
my-slides/
├── slides.md
└── layouts/
    └── cover.vue    # Overrides theme's cover layout
```

### Override Styles

Create `styles/` in project root:

```
my-slides/
├── slides.md
└── styles/
    └── index.css    # Additional global styles
```

Or `style.css` at root level.

### Override Components

Create `components/` in project root:

```
my-slides/
├── slides.md
└── components/
    └── Tweet.vue    # Overrides built-in Tweet
```

## Creating Themes

See official docs: https://sli.dev/guide/write-theme

Theme package structure:

```
slidev-theme-mytheme/
├── package.json
├── styles/
│   └── index.css
├── layouts/
│   ├── cover.vue
│   └── default.vue
├── components/
│   └── MyComponent.vue
└── setup/
    └── main.ts      # Optional setup hook
```

`package.json` requires:

```json
{
  "name": "slidev-theme-mytheme",
  "keywords": ["slidev-theme"],
  "slidev": {
    "colorSchema": "both",
    "highlighter": "shiki"
  }
}
```

## Creating Addons

Similar to themes but for features:

```
slidev-addon-myaddon/
├── package.json
├── components/
│   └── MyFeature.vue
└── setup/
    └── main.ts
```

`package.json`:

```json
{
  "name": "slidev-addon-myaddon",
  "keywords": ["slidev-addon", "slidev"]
}
```
