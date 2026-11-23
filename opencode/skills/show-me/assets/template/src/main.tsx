import { createRoot } from "react-dom/client"
import Content from "./content.mdx"
import { Code } from "./code"
import { Diagram, DiagramScope, DiagramTarget } from "./diagram"
import { Link, MentionScope } from "./mentions"
import "./styles.css"

const root = document.getElementById("root")
if (root === null) {
  throw new Error("The document root is missing")
}

createRoot(root).render(
  <Content components={{ Code, Diagram, DiagramScope, DiagramTarget, MentionScope, a: Link }} />,
)
