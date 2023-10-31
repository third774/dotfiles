import {
  Action,
  Alert,
  Icon,
  LaunchType,
  clearSearchBar,
  confirmAlert,
  launchCommand,
} from "@raycast/api";
import { useFeedbinApiContext } from "../utils/FeedbinApiContext";
import { Subscription, unsubscribe } from "../utils/api";

export interface ActionUnsubscribeProps {
  subscription: Subscription;
}

export function ActionUnsubscribe(props: ActionUnsubscribeProps) {
  const { subscriptions } = useFeedbinApiContext();

  // Don't allow unsubscribing from Pages feeds
  if (props.subscription.site_url === "http://pages.feedbinusercontent.com") {
    return null;
  }

  return (
    <Action
      title="Unsubscribe"
      icon={Icon.MinusCircle}
      shortcut={{
        key: "u",
        modifiers: ["cmd"],
      }}
      onAction={async () => {
        if (
          await confirmAlert({
            title: `Are you sure?`,
            message: props.subscription.title,
            icon: Icon.ExclamationMark,
            primaryAction: {
              title: "Unsubscribe",
              style: Alert.ActionStyle.Destructive,
            },
          })
        ) {
          await subscriptions.mutate(unsubscribe(props.subscription.id), {
            optimisticUpdate: (subs) =>
              subs?.filter((sub) => sub.id !== props.subscription.id),
          });
          launchCommand({
            name: "unread-menu-bar",
            type: LaunchType.Background,
          });
          clearSearchBar();
        }
      }}
    />
  );
}
