import { Action, ActionPanel, List } from "@raycast/api";
import { ShowEntryAction } from "./components/ShowEntryAction";
import { markAsRead, useEntries, useSubscriptionMap } from "./utils/api";

export default function Command() {
  const { isLoading: isLoadingEntries, data: entries } = useEntries();
  const { isLoading: isLoadingSubscriptions, data: subscriptionMap } = useSubscriptionMap();

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
                <Action title="Mark as Read" onAction={() => markAsRead(entry.id)} />
              </ActionPanel>
            }
          />
        ))}
    </List>
  );
}
