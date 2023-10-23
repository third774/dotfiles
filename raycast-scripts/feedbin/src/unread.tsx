import { Action, ActionPanel, List } from "@raycast/api";
import { ShowEntryAction } from "./components/ShowEntryAction";
import { markAsRead, useEntries, useSubscriptionMap } from "./utils/api";

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
            subtitle={subscriptionMap[entry.feed_id]?.title ?? entry.url}
            actions={
              <ActionPanel>
                <ShowEntryAction entry={entry} />
                <Action.OpenInBrowser url={entry.url} />
                <Action
                  title="Mark as Read"
                  onAction={async () => {
                    mutate(markAsRead(entry.id), {
                      optimisticUpdate: (data) => data?.filter((e) => e.id !== entry.id),
                      rollbackOnError: () => entries,
                    });
                  }}
                  shortcut={{
                    key: "r",
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
