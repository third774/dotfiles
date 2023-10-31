import { Action, Icon, LaunchType, launchCommand } from "@raycast/api";
import { useFeedbinApiContext } from "../utils/FeedbinApiContext";
import { markAsRead } from "../utils/api";

export interface ActionMarkAsReadProps {
  id: number;
  onAction?: () => void;
}

export function ActionMarkAsRead(props: ActionMarkAsReadProps) {
  const { unreadEntriesSet, unreadEntriesIds } = useFeedbinApiContext();
  if (!unreadEntriesSet.has(props.id)) return null;
  return (
    <Action
      title="Mark as Read"
      icon={Icon.Check}
      onAction={async () => {
        await unreadEntriesIds.mutate(markAsRead(props.id), {
          optimisticUpdate: (ids) => ids?.filter((id) => id !== props.id),
          shouldRevalidateAfter: false,
        });
        await launchCommand({
          name: "unread-menu-bar",
          type: LaunchType.Background,
        });
        props.onAction?.();
      }}
      shortcut={{
        key: "m",
        modifiers: ["cmd"],
      }}
    />
  );
}
