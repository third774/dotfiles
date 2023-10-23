import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ActionShowEntry } from "./components/ActionShowEntry";
import { deleteStarredEntries, useStarredEntries, useStarredEntriesSet, useSubscriptionMap } from "./utils/api";

export default function Command(): JSX.Element {
  const { data, isLoading, mutate } = useStarredEntries();
  const { mutate: mutateStarredEntriesSet } = useStarredEntriesSet();
  const { data: subscriptionMap, isLoading: isLoadingSubscriptionMap } = useSubscriptionMap();

  return (
    <List isLoading={isLoading || isLoadingSubscriptionMap}>
      {subscriptionMap &&
        data?.map((entry) => (
          <List.Item
            key={entry.id}
            title={entry.title ?? entry.summary}
            keywords={(subscriptionMap[entry.feed_id]?.title ?? entry.url).split(" ")}
            subtitle={subscriptionMap[entry.feed_id]?.title ?? entry.url}
            accessories={[
              {
                icon: Icon.Star,
              },
            ]}
            actions={
              <ActionPanel>
                <ActionShowEntry entry={entry} />
                <Action.OpenInBrowser url={entry.url} />
                <Action.CopyToClipboard title="Copy URL to Clipboard" content={entry.url} />
                <Action
                  title="Unstar This Content"
                  onAction={async () => {
                    // mutate starredEntriesSet so that other list views will have up to date info
                    mutateStarredEntriesSet(mutate(deleteStarredEntries(entry.id)));
                  }}
                  shortcut={{
                    key: "s",
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
