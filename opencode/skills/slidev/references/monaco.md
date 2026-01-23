# Monaco Editor

Monaco (VS Code's editor) enables live code editing in slides.

## Basic Usage

Add `{monaco}` to code block:

````md
```ts {monaco}
const message = 'Edit me!'
console.log(message)
```
````

Editor is read-only by default in presentation mode.

## Writable Monaco

Allow editing during presentation:

````md
```ts {monaco-write}
let count = 0
count++
```
````

## Monaco Runner

Execute code live with `{monaco-run}`:

````md
```ts {monaco-run}
console.log('Hello from Monaco!')
const result = 1 + 2
console.log('Result:', result)
```
````

Output appears below editor. Supports:
- `console.log()` output
- Return values
- Errors

### Auto-run

Run automatically on load:

````md
```ts {monaco-run} {autorun:true}
console.log('Runs immediately')
```
````

### Hide Runner

Show editor without run capability:

````md
```ts {monaco}
// View-only editor, no execution
```
````

## Diff Mode

Show code diff:

````md
```ts {monaco-diff}
const original = 'before'
~~~
const modified = 'after'
```
````

Use `~~~` to separate original from modified.

## Configuration

### Global Monaco Settings

In headmatter:

```yaml
---
monaco: true           # Enable (default)
monaco: dev            # Only in dev mode
monaco: build          # Only in build
monaco: false          # Disable
monacoTypesSource: local   # 'cdn', 'local', or 'none'
---
```

### Type Sources

`monacoTypesSource` controls TypeScript types:

| Value | Behavior |
|-------|----------|
| `local` | Load from node_modules (default) |
| `cdn` | Load from CDN |
| `none` | No type checking |

### Additional Packages

Load types for packages not in your dependencies:

```yaml
---
monacoTypesAdditionalPackages:
  - lodash
  - '@types/node'
---
```

### Runner Dependencies

Additional modules for monaco-run:

```yaml
---
monacoRunAdditionalDeps:
  - lodash-es
---
```

## Editor Options

Pass Monaco editor options:

````md
```ts {monaco} {editorOptions: {wordWrap: 'on', lineNumbers: 'off'}}
const longText = 'This will wrap if it exceeds the editor width'
```
````

Common options:
- `wordWrap`: `'on'`, `'off'`, `'wordWrapColumn'`
- `lineNumbers`: `'on'`, `'off'`, `'relative'`
- `minimap`: `{ enabled: false }`
- `fontSize`: number
- `tabSize`: number

## Combining with Other Features

### With Line Highlighting

````md
```ts {1,3|5-7}{monaco}
line 1
line 2
line 3
line 4
line 5
line 6
line 7
```
````

### With Clicks

````md
<v-click>

```ts {monaco-run}
console.log('Appears on click')
```

</v-click>
````

## Limitations

- Monaco increases bundle size (~2MB)
- Heavy use may slow down presentations
- Some browser features (clipboard) may require HTTPS
- Complex type inference can be slow
