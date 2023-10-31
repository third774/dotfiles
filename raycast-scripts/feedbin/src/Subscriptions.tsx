import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ActionUnsubscribe } from "./components/ActionUnsubscribe";
import { FeedList } from "./components/FeedList";
import {
  FeedbinApiContextProvider,
  useFeedbinApiContext,
} from "./utils/FeedbinApiContext";
import { Subscription } from "./utils/api";
import { useIcon } from "./utils/useIcon";

export function SubscriptionItem(props: { sub: Subscription }) {
  const icon = useIcon(props.sub.site_url);

  return (
    <List.Item
      key={props.sub.id}
      title={props.sub.title}
      icon={icon}
      subtitle={props.sub.feed_url}
      keywords={[props.sub.site_url]}
      actions={
        <ActionPanel>
          <Action.Push
            title="View Feed"
            icon={Icon.List}
            target={
              <FeedbinApiContextProvider>
                <FeedList feedId={props.sub.feed_id} />
              </FeedbinApiContextProvider>
            }
          />
          <Action.OpenInBrowser url={props.sub.site_url} />
          <Action.CopyToClipboard
            shortcut={{
              modifiers: ["cmd", "shift"],
              key: "c",
            }}
            icon={Icon.CopyClipboard}
            title="Copy Feed URL"
            content={props.sub.feed_url}
          />
          <ActionUnsubscribe subscription={props.sub} />
        </ActionPanel>
      }
    />
  );
}

export function SubscriptionsCommand(): JSX.Element {
  const { subscriptions } = useFeedbinApiContext();

  return (
    <List isLoading={subscriptions.isLoading}>
      {subscriptions.data?.map((sub) => (
        <SubscriptionItem key={sub.feed_id} sub={sub} />
      ))}
    </List>
  );
}

export default function Command() {
  return (
    <FeedbinApiContextProvider>
      <SubscriptionsCommand />
    </FeedbinApiContextProvider>
  );
}
