import { Action, ActionPanel, List } from "@raycast/api";
import { markAsRead, useEntries, useSubscriptionMap } from "./utils/api";
import { ActionShowEntry } from "./components/ActionShowEntry";

export default function Command() {
  const {
    isLoading: isLoadingEntries,
    data: entries,
    mutate,
  } = useEntries({
    read: "false",
  });
  const { isLoading: isLoadingSubscriptions, data: subscriptionMap } = useSubscriptionMap();

  console.log(entries);

  return (
    <List isLoading={isLoadingEntries || isLoadingSubscriptions}>
      {subscriptionMap &&
        entries?.map((entry) => (
          <List.Item
            key={entry.id}
            title={entry.title ?? entry.summary}
            keywords={(subscriptionMap[entry.feed_id]?.title ?? entry.url).split(" ")}
            subtitle={subscriptionMap[entry.feed_id]?.title ?? entry.url}
            actions={
              <ActionPanel>
                <ActionShowEntry entry={entry} />
                <Action.OpenInBrowser url={entry.url} />
                <Action.CopyToClipboard title="Copy URL to Clipboard" content={entry.url} />
                <Action
                  title="Mark as Read"
                  onAction={async () => {
                    mutate(markAsRead(entry.id), {
                      optimisticUpdate: (data) => data?.filter((e) => e.id !== entry.id),
                      rollbackOnError: () => entries,
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
