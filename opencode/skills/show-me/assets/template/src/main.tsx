import { createRoot } from "react-dom/client"
import { Pre, type HighlightedCode } from "codehike/code"
import Content from "./content.mdx"
import { Diagram } from "./diagram"
import "./styles.css"

function Code({ codeblock }: { codeblock: HighlightedCode }) {
  return <Pre code={codeblock} style={codeblock.style} />
}

const root = document.getElementById("root")
if (root === null) {
  throw new Error("The document root is missing")
}

createRoot(root).render(<Content components={{ Code, Diagram }} />)
