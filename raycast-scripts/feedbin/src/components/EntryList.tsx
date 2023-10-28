import { Action, ActionPanel, Icon, LaunchType, List, launchCommand } from "@raycast/api";
import {
  Entry,
  deleteStarredEntries,
  markAsRead,
  starEntries,
  useIcons,
  useStarredEntriesSet,
  useSubscriptionMap,
  useUnreadEntriesIdSet,
} from "../utils/api";
import { ActionShowEntry } from "./ActionShowEntry";

export interface EntryListProps {
  markEntryReadMutation?: (promise: Promise<unknown>, entryId?: number) => Promise<void>;
  isLoading: boolean;
  entries?: Entry[];
}

export function EntryList(props: EntryListProps) {
  const { isLoading: isLoadingSubscriptions, data: subscriptionMap } = useSubscriptionMap();
  const { isLoading: isLoadingIcons, data: icons } = useIcons();
  const {
    isLoading: isLoadingStarredEntries,
    data: starredEntriesSet,
    mutate: mutateStarredEntries,
  } = useStarredEntriesSet();
  const { isLoading: isLoadingUnreadEntriesSet, data: unreadEntriesSet } = useUnreadEntriesIdSet();

  return (
    <List
      isLoading={
        props.isLoading ||
        isLoadingSubscriptions ||
        isLoadingStarredEntries ||
        isLoadingUnreadEntriesSet ||
        isLoadingIcons
      }
    >
      {props.entries && props.entries.length === 0 && (
        <List.EmptyView icon={Icon.CheckRosette} title="No unread content!" />
      )}
      {subscriptionMap &&
        unreadEntriesSet &&
        props.entries?.map((entry) => (
          <List.Item
            key={entry.id}
            title={entry.title ?? entry.summary}
            icon={icons[new URL(entry.url).host] ?? Icon.Globe}
            keywords={(subscriptionMap[entry.feed_id]?.title ?? entry.url).split(" ")}
            subtitle={subscriptionMap[entry.feed_id]?.title ?? entry.url}
            accessories={
              starredEntriesSet.has(entry.id)
                ? [
                    {
                      icon: Icon.Star,
                    },
                  ]
                : []
            }
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={entry.url} />
                <ActionShowEntry entry={entry} />
                <Action.CopyToClipboard
                  title="Copy URL to Clipboard"
                  content={entry.url}
                  shortcut={{
                    key: "c",
                    modifiers: ["cmd", "shift"],
                  }}
                />
                {starredEntriesSet.has(entry.id) ? (
                  <Action
                    title="Unstar This Content"
                    icon={Icon.StarDisabled}
                    onAction={async () => {
                      mutateStarredEntries(deleteStarredEntries(entry.id));
                    }}
                    shortcut={{
                      key: "s",
                      modifiers: ["cmd"],
                    }}
                  />
                ) : (
                  <Action
                    title="Star This Content"
                    icon={Icon.Star}
                    onAction={async () => {
                      mutateStarredEntries(starEntries(entry.id));
                    }}
                    shortcut={{
                      key: "s",
                      modifiers: ["cmd"],
                    }}
                  />
                )}
                {unreadEntriesSet.has(entry.id) && (
                  <Action
                    title="Mark as Read"
                    icon={Icon.Check}
                    onAction={async () => {
                      await props.markEntryReadMutation?.(markAsRead(entry.id), entry.id);
                      await launchCommand({
                        name: "unread-menu-bar",
                        type: LaunchType.Background,
                      });
                    }}
                    shortcut={{
                      key: "m",
                      modifiers: ["cmd"],
                    }}
                  />
                )}
              </ActionPanel>
            }
          />
        ))}
    </List>
  );
}
