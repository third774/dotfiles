// Opens the shipped Remove worktree dialog for the focused space, as the space
// menu does. `mod.open` passes no props, so this mod reads the target from focus.

import { View, div } from "gpui-kit";
import { props, spaces, focused, openOverlay, closeOverlay, checking } from "herdr";

export default class WorktreeRemove extends View {
  init() {
    if (checking()) return;
    const space = spaces().find((s) => s.id === focused()?.space) ?? spaces().find((s) => s.active);
    closeOverlay(props().overlay);
    if (space) openOverlay({ mod: "worktree", kind: "dialog", width: 440, height: 260, props: { space: space.id, action: "remove" } });
  }

  render() {
    return div();
  }
}
