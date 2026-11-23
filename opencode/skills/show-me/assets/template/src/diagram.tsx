import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react"
import { mount } from "pele"
import "./diagram.css"

/**
 * Interactive diagram linking connects Pele diagram nodes (or clusters) to
 * companion explanation tiles inside a `<DiagramScope>`.
 *
 * Wrap a `<Diagram>` and its `<DiagramTarget nodes={...}>` items in a
 * `<DiagramScope>`. Hovering or focusing a linked diagram node highlights its
 * matching target(s) and dims unrelated ones; hovering or focusing a target
 * highlights its diagram node(s). Click or Enter/Space pins the selection until
 * another activation or Escape.
 */

type Selection =
  | { kind: "node"; nodeId: string }
  | { kind: "target"; targetId: string; nodeIds: ReadonlySet<string> }

type SelectionState = {
  pinned: Selection | null
  previewed: Selection | null
}

type DiagramScopeValue = {
  active: Selection | null
  pinned: Selection | null
  linkedNodes: ReadonlySet<string>
  preview: (selection: Selection) => void
  clearPreview: (selection: Selection) => void
  togglePin: (selection: Selection) => void
  registerDiagram: (diagramId: string, nodeIds: ReadonlySet<string> | null) => void
  registerTarget: (targetId: string, nodeIds: ReadonlySet<string> | null) => void
}

const DiagramContext = createContext<DiagramScopeValue | null>(null)

function sameSet(a: ReadonlySet<string> | undefined, b: ReadonlySet<string>): boolean {
  if (a === undefined || a.size !== b.size) return false
  for (const value of a) {
    if (!b.has(value)) return false
  }
  return true
}

function sameSelection(a: Selection | null, b: Selection): boolean {
  if (a === null || a.kind !== b.kind) return false
  if (a.kind === "node" && b.kind === "node") return a.nodeId === b.nodeId
  if (a.kind === "target" && b.kind === "target") return a.targetId === b.targetId
  return false
}

function isNodeSelected(selection: Selection | null, nodeId: string): boolean {
  if (selection === null) return false
  return selection.kind === "node" ? selection.nodeId === nodeId : selection.nodeIds.has(nodeId)
}

function isTargetSelected(
  selection: Selection | null,
  targetId: string,
  nodeIds: ReadonlySet<string>,
): boolean {
  if (selection === null) return false
  return selection.kind === "target"
    ? selection.targetId === targetId
    : nodeIds.has(selection.nodeId)
}

function parseNodeIdsKey(nodes: string | readonly string[]): string {
  const list = typeof nodes === "string" ? [nodes] : nodes
  const ids: string[] = []
  for (const raw of list) {
    const id = raw.trim()
    if (id !== "" && !ids.includes(id)) ids.push(id)
  }
  if (ids.length === 0) {
    throw new Error("DiagramTarget requires at least one non-empty node id")
  }
  return ids.join("\0")
}

function closestLinkedNode(target: EventTarget | null): Element | null {
  return target instanceof Element ? target.closest("[data-diagram-linked]") : null
}

function isInteractiveChild(target: EventTarget | null, boundary: Element): boolean {
  if (!(target instanceof Element)) return false
  const interactive = target.closest(
    "a, button, input, select, textarea, summary, [role='button']",
  )
  return interactive !== null && interactive !== boundary && boundary.contains(interactive)
}

function updateRegistry(
  current: ReadonlyMap<string, ReadonlySet<string>>,
  id: string,
  nodeIds: ReadonlySet<string> | null,
): ReadonlyMap<string, ReadonlySet<string>> {
  if (nodeIds === null) {
    if (!current.has(id)) return current
    const next = new Map(current)
    next.delete(id)
    return next
  }
  if (sameSet(current.get(id), nodeIds)) return current
  const next = new Map(current)
  next.set(id, nodeIds)
  return next
}

export function DiagramScope({ children }: { children: ReactNode }) {
  if (useContext(DiagramContext) !== null) {
    throw new Error("DiagramScope cannot be inside another DiagramScope")
  }

  const [selection, setSelection] = useState<SelectionState>({ pinned: null, previewed: null })
  const [diagrams, setDiagrams] = useState<ReadonlyMap<string, ReadonlySet<string>>>(
    () => new Map(),
  )
  const [targets, setTargets] = useState<ReadonlyMap<string, ReadonlySet<string>>>(() => new Map())

  const active = selection.previewed ?? selection.pinned

  const linkedNodes = useMemo(() => {
    const ids = new Set<string>()
    for (const nodeIds of targets.values()) {
      for (const id of nodeIds) ids.add(id)
    }
    return ids
  }, [targets])

  const registerDiagram = useCallback(
    (diagramId: string, nodeIds: ReadonlySet<string> | null) => {
      setDiagrams((current) => updateRegistry(current, diagramId, nodeIds))
    },
    [],
  )

  const registerTarget = useCallback((targetId: string, nodeIds: ReadonlySet<string> | null) => {
    setTargets((current) => updateRegistry(current, targetId, nodeIds))
  }, [])

  const preview = useCallback((next: Selection) => {
    setSelection((current) => ({ ...current, previewed: next }))
  }, [])

  const clearPreview = useCallback((previous: Selection) => {
    setSelection((current) =>
      sameSelection(current.previewed, previous) ? { ...current, previewed: null } : current,
    )
  }, [])

  const togglePin = useCallback((next: Selection) => {
    setSelection((current) => {
      if (sameSelection(current.pinned, next)) {
        return {
          pinned: null,
          previewed: sameSelection(current.previewed, next) ? null : current.previewed,
        }
      }
      return { ...current, pinned: next }
    })
  }, [])

  useEffect(() => {
    if (targets.size === 0) return
    if (diagrams.size === 0) {
      console.error("DiagramScope has DiagramTarget items but no rendered Diagram")
      return
    }
    const available = new Set<string>()
    for (const nodeIds of diagrams.values()) {
      for (const id of nodeIds) available.add(id)
    }
    for (const nodeId of linkedNodes) {
      if (!available.has(nodeId)) {
        console.error(
          `DiagramTarget references node "${nodeId}", which is not in any Diagram in its DiagramScope`,
        )
      }
    }
  }, [diagrams, targets, linkedNodes])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || active === null) return
    setSelection({ pinned: null, previewed: null })
  }

  const value: DiagramScopeValue = useMemo(
    () => ({
      active,
      pinned: selection.pinned,
      linkedNodes,
      preview,
      clearPreview,
      togglePin,
      registerDiagram,
      registerTarget,
    }),
    [
      active,
      selection.pinned,
      linkedNodes,
      preview,
      clearPreview,
      togglePin,
      registerDiagram,
      registerTarget,
    ],
  )

  return (
    <DiagramContext value={value}>
      <div
        className="diagram-scope"
        data-diagram-active={active !== null ? "" : undefined}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </DiagramContext>
  )
}

type DiagramTargetProps = {
  nodes: string | readonly string[]
  className?: string
  children: ReactNode
}

/**
 * Companion explanation item linked to one or more Pele node or cluster IDs
 * inside the enclosing `<DiagramScope>`.
 */
export function DiagramTarget({ nodes, className, children }: DiagramTargetProps) {
  const scope = useContext(DiagramContext)
  if (scope === null) {
    throw new Error("DiagramTarget must be inside a DiagramScope")
  }

  const targetId = useId()
  const nodesKey = parseNodeIdsKey(nodes)
  const nodeIds = useMemo(() => new Set<string>(nodesKey.split("\0")), [nodesKey])
  const selection = useMemo<Selection>(
    () => ({ kind: "target", targetId, nodeIds }),
    [targetId, nodeIds],
  )

  const { registerTarget, preview, clearPreview, togglePin } = scope

  useEffect(() => {
    registerTarget(targetId, nodeIds)
    return () => registerTarget(targetId, null)
  }, [registerTarget, targetId, nodeIds])

  const isActive = isTargetSelected(scope.active, targetId, nodeIds)
  const isPinned = sameSelection(scope.pinned, selection)

  function onClick(event: MouseEvent<HTMLDivElement>) {
    if (isInteractiveChild(event.target, event.currentTarget)) return
    const selectedText = window.getSelection()?.toString() ?? ""
    if (selectedText !== "") return
    togglePin(selection)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    togglePin(selection)
  }

  const classes =
    className === undefined || className.trim() === ""
      ? "diagram-target"
      : `diagram-target ${className}`

  return (
    <div
      className={classes}
      tabIndex={0}
      data-diagram-target=""
      data-diagram-on={isActive ? "" : undefined}
      data-diagram-pinned={isPinned ? "" : undefined}
      onMouseEnter={() => preview(selection)}
      onMouseLeave={() => clearPreview(selection)}
      onFocus={() => preview(selection)}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        ) {
          return
        }
        clearPreview(selection)
      }}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  )
}

function syncDiagramSvg(
  element: HTMLElement,
  linkedNodes: ReadonlySet<string>,
  active: Selection | null,
  pinned: Selection | null,
): ReadonlySet<string> {
  const renderedIds = new Set<string>()
  let hasActiveNode = false
  let hasActiveCluster = false

  for (const node of element.querySelectorAll(".pele-node[data-id], .pele-cluster[data-id]")) {
    const nodeId = node.getAttribute("data-id")
    if (nodeId === null) continue
    renderedIds.add(nodeId)

    const isLinked = linkedNodes.has(nodeId)
    if (isLinked) {
      node.setAttribute("data-diagram-linked", "")
      node.setAttribute("tabindex", "0")
      node.setAttribute("role", "button")
      const nodePinned = sameSelection(pinned, { kind: "node", nodeId })
      node.setAttribute("aria-pressed", nodePinned ? "true" : "false")
      if (!node.hasAttribute("aria-label")) {
        const label = (node.textContent ?? "").replace(/\s+/g, " ").trim()
        node.setAttribute("aria-label", label !== "" ? label : nodeId)
      }
    } else {
      node.removeAttribute("data-diagram-linked")
      node.removeAttribute("tabindex")
      node.removeAttribute("role")
      node.removeAttribute("aria-pressed")
    }

    if (isLinked && isNodeSelected(active, nodeId)) {
      node.setAttribute("data-diagram-on", "")
      if (node.classList.contains("pele-cluster")) {
        hasActiveCluster = true
      } else {
        hasActiveNode = true
      }
    } else {
      node.removeAttribute("data-diagram-on")
    }
  }

  if (hasActiveNode) {
    element.setAttribute("data-diagram-has-active-node", "")
  } else {
    element.removeAttribute("data-diagram-has-active-node")
  }

  if (hasActiveCluster) {
    element.setAttribute("data-diagram-has-active-cluster", "")
  } else {
    element.removeAttribute("data-diagram-has-active-cluster")
  }

  return renderedIds
}

type DiagramProps = {
  source: string
  title: string
  description: string
}

const EMPTY_SET: ReadonlySet<string> = new Set()

/** React owns the figure; Pele owns only the empty diagram container. */
export function Diagram({ source, title, description }: DiagramProps) {
  const container = useRef<HTMLDivElement>(null)
  const id = useId()
  const scope = useContext(DiagramContext)

  const linkedNodes = scope?.linkedNodes ?? EMPTY_SET
  const active = scope?.active ?? null
  const pinned = scope?.pinned ?? null
  const registerDiagram = scope?.registerDiagram

  const syncRef = useRef<() => void>(() => {})
  syncRef.current = () => {
    const element = container.current
    if (element === null) return
    const renderedIds = syncDiagramSvg(element, linkedNodes, active, pinned)
    registerDiagram?.(id, renderedIds)
  }

  useEffect(() => {
    const element = container.current
    if (element === null) return

    const diagram = mount(element, source, {
      idPrefix: id,
      links: false,
      images: false,
      zoom: "auto",
      onRender: () => {
        syncRef.current()
      },
    })

    return () => {
      diagram.destroy()
      element.replaceChildren()
      element.removeAttribute("data-diagram-has-active-node")
      element.removeAttribute("data-diagram-has-active-cluster")
      registerDiagram?.(id, null)
    }
  }, [source, id, registerDiagram])

  useEffect(() => {
    const element = container.current
    if (element === null) return
    syncDiagramSvg(element, linkedNodes, active, pinned)
  }, [linkedNodes, active, pinned])

  const preview = scope?.preview
  const clearPreview = scope?.clearPreview
  const togglePin = scope?.togglePin

  useEffect(() => {
    const element = container.current
    if (
      element === null ||
      preview === undefined ||
      clearPreview === undefined ||
      togglePin === undefined
    ) {
      return
    }

    const onPreview = preview
    const onClearPreview = clearPreview
    const onTogglePin = togglePin
    let pointerDown: { x: number; y: number } | null = null

    function onPointerOver(event: PointerEvent) {
      const node = closestLinkedNode(event.target)
      if (node === null) return
      const nodeId = node.getAttribute("data-id")
      if (nodeId !== null) onPreview({ kind: "node", nodeId })
    }

    function onPointerOut(event: PointerEvent) {
      const fromNode = closestLinkedNode(event.target)
      if (fromNode === null) return
      const toNode = closestLinkedNode(event.relatedTarget)
      if (toNode === fromNode) return
      const nodeId = fromNode.getAttribute("data-id")
      if (nodeId !== null) onClearPreview({ kind: "node", nodeId })
    }

    function onPointerDown(event: PointerEvent) {
      pointerDown = { x: event.clientX, y: event.clientY }
    }

    function onClick(event: globalThis.MouseEvent) {
      if (pointerDown !== null) {
        const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
        pointerDown = null
        if (distance >= 6) return
      }
      const node = closestLinkedNode(event.target)
      if (node === null) return
      const nodeId = node.getAttribute("data-id")
      if (nodeId !== null) onTogglePin({ kind: "node", nodeId })
    }

    function onFocusIn(event: FocusEvent) {
      const node = closestLinkedNode(event.target)
      if (node === null) return
      const nodeId = node.getAttribute("data-id")
      if (nodeId !== null) onPreview({ kind: "node", nodeId })
    }

    function onFocusOut(event: FocusEvent) {
      const node = closestLinkedNode(event.target)
      if (node === null) return
      const nodeId = node.getAttribute("data-id")
      if (nodeId !== null) onClearPreview({ kind: "node", nodeId })
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Enter" && event.key !== " ") return
      const node = closestLinkedNode(event.target)
      if (node === null) return
      const nodeId = node.getAttribute("data-id")
      if (nodeId === null) return
      event.preventDefault()
      onTogglePin({ kind: "node", nodeId })
    }

    element.addEventListener("pointerover", onPointerOver)
    element.addEventListener("pointerout", onPointerOut)
    element.addEventListener("pointerdown", onPointerDown)
    element.addEventListener("click", onClick)
    element.addEventListener("focusin", onFocusIn)
    element.addEventListener("focusout", onFocusOut)
    element.addEventListener("keydown", onKeyDown)

    return () => {
      element.removeEventListener("pointerover", onPointerOver)
      element.removeEventListener("pointerout", onPointerOut)
      element.removeEventListener("pointerdown", onPointerDown)
      element.removeEventListener("click", onClick)
      element.removeEventListener("focusin", onFocusIn)
      element.removeEventListener("focusout", onFocusOut)
      element.removeEventListener("keydown", onKeyDown)
    }
  }, [preview, clearPreview, togglePin])

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
