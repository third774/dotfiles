# App setup

## New temporary app

Use the session's approved temporary directory as the parent when supplied.
Otherwise, obtain the system temporary directory from the host. Create a unique
child directory with `mktemp -d` or Node's `mkdtemp`. Do not hardcode a home path
or reuse another explanation's directory.

Copy the contents of `assets/template/` from this skill's base directory into
that child directory. Do not install packages or generate content in the shared
template. Keep the source repository separate and use absolute paths when
reading it. Do not move the session away from the source repository just to
build the explanation.

The template requires Node.js 22.18 or later and npm. In the copied directory:

```sh
npm install
npm run build
```

Use the shell tool's working-directory parameter for these commands. The build
runs TypeScript, Vite, and a check that the output is exactly one HTML file.
There is no dev-server command in the template.

## Setup files

- `vite.config.ts` connects MDX, Code Hike, and React. Syntax highlighting runs
  during MDX compilation, not in the browser.
- `scripts/build.ts` builds with Vite in memory, parses the generated HTML, and
  inlines its JavaScript and CSS. It rejects leftover resources and writes only
  `dist/index.html`.
- `src/main.tsx` connects MDX code blocks to Code Hike's `Pre` component. Add
  annotation handlers and custom components here or in separate source modules
  as needed. `Pre` alone does not implement the documentation's annotations.
- `src/diagram.tsx` registers the `Diagram` MDX component for Pele. Its effect
  owns the mount and cleanup; `src/diagram.css` supplies component rules. Read
  [the diagram reference](diagrams.md) before using or changing this wrapper.
- `src/content.mdx` and `src/styles.css` are empty. Write the explanation and
  its presentation from the teaching outline. They are not content examples.
- `index.html` contains only the document shell. Set its title for the explanation.
- `scripts/check-build.mjs` rejects additional output files. It does not replace
  an offline browser test or detect all possible runtime network requests.

Read [the local annotation reference](annotations.md) and the selected feature
references before extending the setup. Use their upstream links for details not
covered locally. Adapt examples to a client React app: no React Server Components,
request-time highlighting, or server APIs. Keep types strict; do not copy unsafe
type assertions from documentation.

## Single-file constraints

- Import assets through the bundler so they can become data URLs, or use inline
  SVG. Do not put required files in a `public/` directory; it is disabled.
- Use system fonts or embed licensed font files. Do not load fonts from a CDN.
- Do not use runtime fetching, external imports, web workers, service workers,
  or additional HTML entry points. Keep all required data in the build.
- Use in-page anchors or hash navigation, not history-based routes.
- Do not depend on storage or clipboard APIs being available under `file://`.
  Provide a useful fallback if an optional feature needs one.
- Do not inject source code as raw HTML. Let React and Code Hike escape it.
  For diagrams, let Pele insert its generated SVG in the wrapper's isolated
  container. Keep diagram links and images disabled.
- A successful single-file build does not prove that third-party components
  work offline. Test the actual built file with normal browser security.

Open `dist/index.html` with the platform opener only after the checks pass.
Leave the source directory and output in place for follow-up edits.
