import { Action, ActionPanel, Icon, LaunchType, List, launchCommand } from "@raycast/api";
import {
  deleteStarredEntries,
  markAsRead,
  starEntries,
  useEntries,
  useStarredEntries,
  useSubscriptionMap,
} from "./utils/api";
import { ActionShowEntry } from "./components/ActionShowEntry";

export default function Command() {
  const { isLoading: isLoadingEntries, data: entries, mutate } = useEntries();
  const { isLoading: isLoadingSubscriptions, data: subscriptionMap } = useSubscriptionMap();
  const {
    isLoading: isLoadingStarredEntries,
    data: starredEntriesSet,
    mutate: mutateStarredEntries,
  } = useStarredEntries();

  return (
    <List isLoading={isLoadingEntries || isLoadingSubscriptions || isLoadingStarredEntries}>
      {subscriptionMap &&
        starredEntriesSet &&
        entries?.map((entry) => (
          <List.Item
            key={entry.id}
            title={entry.title ?? entry.summary}
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
                <ActionShowEntry entry={entry} />
                <Action.OpenInBrowser url={entry.url} />
                <Action.CopyToClipboard title="Copy URL to Clipboard" content={entry.url} />
                {starredEntriesSet.has(entry.id) ? (
                  <Action
                    title="Unstar This Content"
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
                    onAction={async () => {
                      mutateStarredEntries(starEntries(entry.id));
                    }}
                    shortcut={{
                      key: "s",
                      modifiers: ["cmd"],
                    }}
                  />
                )}
                <Action
                  title="Mark as Read"
                  onAction={async () => {
                    await mutate(markAsRead(entry.id), {
                      optimisticUpdate: (data) => data?.filter((e) => e.id !== entry.id),
                      rollbackOnError: () => entries,
                    });
                    launchCommand({
                      name: "unread-menu-bar",
                      type: LaunchType.Background,
                    });
                  }}
                  shortcut={{
                    key: "m",
                    modifiers: ["cmd"],
                  }}
                />
              </ActionPanel>
            }
          />
        ))}
    </List>
  );
}
