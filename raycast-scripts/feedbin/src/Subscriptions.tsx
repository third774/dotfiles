import {
  Action,
  ActionPanel,
  Alert,
  Icon,
  LaunchType,
  List,
  clearSearchBar,
  confirmAlert,
  launchCommand,
} from "@raycast/api";
import { EntryList } from "./components/EntryList";
import { unsubscribe, useFeedEntries, useSubscriptions } from "./utils/api";

function FeedList(props: { feedId: number }) {
  const { data, isLoading, mutate } = useFeedEntries(props.feedId);
  return <EntryList entries={data} isLoading={isLoading} mutateEntries={mutate} />;
}

export default function SubscriptionsCommand(): JSX.Element {
  const { data, isLoading, mutate } = useSubscriptions();

  return (
    <List isLoading={isLoading}>
      {data?.map((sub) => (
        <List.Item
          key={sub.id}
          title={sub.title}
          subtitle={sub.site_url}
          actions={
            <ActionPanel>
              <Action.Push title="View Feed" target={<FeedList feedId={sub.feed_id} />} />
              <Action.CopyToClipboard
                shortcut={{
                  key: "c",
                  modifiers: ["cmd", "shift"],
                }}
                content={sub.site_url}
              />
              <Action
                title="Unsubscribe"
                shortcut={{
                  key: "u",
                  modifiers: ["cmd"],
                }}
                onAction={async () => {
                  if (
                    await confirmAlert({
                      title: `Are you sure?`,
                      message: sub.title,
                      icon: Icon.ExclamationMark,
                      primaryAction: {
                        title: "Unsubscribe",
                        style: Alert.ActionStyle.Destructive,
                      },
                    })
                  ) {
                    await mutate(unsubscribe(sub.id));
                    launchCommand({
                      name: "unread-menu-bar",
                      type: LaunchType.Background,
                    });
                    clearSearchBar();
                  }
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
