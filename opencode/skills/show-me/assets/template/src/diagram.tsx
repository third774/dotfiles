import { useEffect, useId, useRef } from "react"
import { mount } from "pele"
import "./diagram.css"

type DiagramProps = {
  source: string
  title: string
  description: string
}

/** React owns the figure; Pele owns only the empty diagram container. */
export function Diagram({ source, title, description }: DiagramProps) {
  const container = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    const element = container.current
    if (element === null) return

    const diagram = mount(element, source, {
      idPrefix: id,
      links: false,
      images: false,
      zoom: "auto",
    })

    return () => {
      diagram.destroy()
      element.replaceChildren()
    }
  }, [source, id])

  return (
    <figure className="explain-diagram" aria-labelledby={`${id}-caption`}>
      <figcaption id={`${id}-caption`}>{title}</figcaption>
      <p>{description}</p>
      <div ref={container} className="explain-diagram-canvas" />
      <details>
        <summary>Diagram source</summary>
        <pre>{source}</pre>
      </details>
    </figure>
  )
}
