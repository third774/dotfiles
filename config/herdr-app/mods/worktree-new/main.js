// Opens the shipped New worktree dialog for the focused space, as the + menu
// does. `mod.open` passes no props, so this mod reads the target from focus.

import { View, div } from "gpui-kit";
import { props, spaces, focused, openOverlay, closeOverlay, checking } from "herdr";

export default class WorktreeNew extends View {
  init() {
    if (checking()) return;
    const f = focused();
    const space = spaces().find((s) => s.id === f?.space) ?? spaces().find((s) => s.active);
    closeOverlay(props().overlay);
    if (space) openOverlay({ mod: "worktree", kind: "dialog", width: 460, height: 280, props: { space: space.id, folder: f?.cwd ?? undefined, action: "new" } });
  }

  render() {
    return div();
  }
}
