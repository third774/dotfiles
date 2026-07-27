#!/bin/sh
set -eu

herdr_bin=${HERDR_BIN_PATH:?HERDR_BIN_PATH is required}
workspace_id=$(printf '%s' "${HERDR_PLUGIN_EVENT_JSON:?HERDR_PLUGIN_EVENT_JSON is required}" | jq -er '
  .data.workspace.workspace_id
  // .data.workspace_id
  // .workspace.workspace_id
  // .workspace_id
')
root_pane_id=$("$herdr_bin" pane list --workspace "$workspace_id" | jq -er '.result.panes[0].pane_id')

"$herdr_bin" pane run "$root_pane_id" nvim >/dev/null
bottom_left_pane_id=$("$herdr_bin" pane split "$root_pane_id" --direction down --ratio 0.666667 --no-focus | jq -er '.result.pane.pane_id')
"$herdr_bin" pane run "$bottom_left_pane_id" oc >/dev/null
"$herdr_bin" pane split "$bottom_left_pane_id" --direction right --ratio 0.5 --focus >/dev/null
