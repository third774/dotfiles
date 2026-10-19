import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { defaultTreeAdapter, parse, serialize, type DefaultTreeAdapterTypes } from "parse5"
import { build } from "vite"

// Inline only files from this build. Do not read paths supplied by HTML content.
const result = await build({ build: { write: false } })
if (Array.isArray(result) || !("output" in result)) {
  throw new Error("Expected one Vite build output")
}

const files = new Map(result.output.map((file) => [file.fileName, file]))
const html = files.get("index.html")
if (html?.type !== "asset") {
  throw new Error("The build must contain index.html")
}
files.delete(html.fileName)

function text(source: string | Uint8Array) {
  return typeof source === "string" ? source : Buffer.from(source).toString("utf8")
}

function inline(node: DefaultTreeAdapterTypes.Node) {
  if ("tagName" in node) {
    const attribute = (name: string) => node.attrs.find((item) => item.name === name)?.value
    const script = node.tagName === "script" ? attribute("src") : undefined
    const style = node.tagName === "link" && attribute("rel") === "stylesheet"
      ? attribute("href")
      : undefined
    const reference = script ?? style

    if (reference !== undefined) {
      const name = reference.replace(/^\.\//, "")
      const file = files.get(name)
      if (file === undefined) {
        throw new Error(`Resource is not part of the build: ${reference}`)
      }

      let source: string
      if (script !== undefined && file.type === "chunk") {
        assert.equal(file.imports.length, 0, "JavaScript must have no external imports")
        assert.equal(file.dynamicImports.length, 0, "JavaScript must have no dynamic imports")
        // HTML parses script end tags even inside JavaScript strings.
        source = file.code.replace(/<(\/script|!--)/gi, "\\x3C$1")
        node.attrs = node.attrs.filter((item) => !["src", "crossorigin"].includes(item.name))
      } else if (style !== undefined && file.type === "asset") {
        source = text(file.source).replace(/<\/style/gi, "<\\/style")
        node.tagName = "style"
        node.nodeName = "style"
        node.attrs = node.attrs.filter((item) => !["href", "rel", "crossorigin"].includes(item.name))
      } else {
        throw new Error(`Unexpected resource type: ${reference}`)
      }

      node.childNodes = []
      defaultTreeAdapter.insertText(node, source)
      files.delete(name)
    }
  }

  if ("childNodes" in node) {
    node.childNodes.forEach(inline)
  }
}

const document = parse(text(html.source))
inline(document)
assert.equal(files.size, 0, `Resources were not inlined: ${[...files.keys()].join(", ")}`)

const directory = new URL("../dist/", import.meta.url)
await mkdir(directory, { recursive: true })
await writeFile(new URL("index.html", directory), serialize(document))
