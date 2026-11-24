// Goes back to the space that was shown before the current one.
//
// Two roles:
// - `mod.open {name: "space-back"}` (a key): shows the previous space, then
//   closes itself. It also (re)starts the tracker.
// - The tracker: a kept, empty window ({ track: true }) that stays alive and
//   records each change of the shown space in shared state. A kept window
//   comes back on the next start, so tracking survives restarts.

import { View, div } from "gpui-kit";
import { props, spaces, shared, setShared, run, openOverlay, closeOverlay, checking } from "herdr";

const HISTORY = "space-back.history"; // { current, previous }: space ids

function history() {
  const h = shared(HISTORY);
  return {
    current: typeof h?.current === "string" ? h.current : null,
    previous: typeof h?.previous === "string" ? h.previous : null,
  };
}

function track() {
  const shown = spaces().find((s) => s.active)?.id ?? null;
  const h = history();
  if (shown && shown !== h.current) setShared(HISTORY, { current: shown, previous: h.current });
}

export default class SpaceBack extends View {
  init() {
    if (checking() || props()?.track) return;
    closeOverlay(props().overlay);
    const { previous } = history();
    openOverlay({ mod: "space-back", kind: "window", key: "space-back-tracker", keep: true, frame: "none", width: 2, height: 2, at: { x: 0, y: 0 }, props: { track: true } });
    if (previous && spaces().some((s) => s.id === previous && !s.active)) run("space.select", { id: previous });
  }

  render() {
    if (props()?.track && !checking()) track();
    return div();
  }
}
