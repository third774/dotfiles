import { MenuBarExtra, open, updateCommandMetadata } from "@raycast/api";
import { useEffect } from "react";
import { Entry, useEntries, useSubscriptionMap } from "./utils/api";

export default function MenuCommand(): JSX.Element {
  const { isLoading, data } = useEntries({ read: "false" });
  const { data: subscriptionMap, isLoading: isLoadingSubscriptionMap } =
    useSubscriptionMap();

  useEffect(() => {
    (async () => {
      await updateCommandMetadata({
        subtitle: `${data?.length.toString() ?? ""} unread items`,
      });
    })();
  }, []);

  const entriesGroupedByFeedId =
    data?.reduce<Record<number, Entry[]>>((acc, entry) => {
      if (acc[entry.feed_id]) {
        acc[entry.feed_id].push(entry);
      } else {
        acc[entry.feed_id] = [entry];
      }
      return acc;
    }, {}) ?? {};

  const entries = Object.entries(entriesGroupedByFeedId).sort(
    ([aKey], [bKey]) =>
      subscriptionMap[+aKey].title.localeCompare(subscriptionMap[+bKey].title),
  );

  const unreadCount = data ? data.length : 0;

  return (
    <MenuBarExtra
      icon={{ source: "feedbin.png" }}
      title={unreadCount ? unreadCount.toString() : undefined}
      isLoading={isLoading || isLoadingSubscriptionMap}
    >
      {unreadCount === 0 && <MenuBarExtra.Section title="No unread items" />}
      {entries.map(([feedId, entries]) => {
        return (
          <MenuBarExtra.Section
            key={feedId}
            title={subscriptionMap?.[+feedId]?.title ?? "Unknown Feed"}
          >
            {entries.map((entry) => {
              let title = entry.title ?? entry.summary;
              if (title.length > 60) {
                title = title.substring(0, 60) + "...";
              }
              return (
                <MenuBarExtra.Item
                  key={entry.id}
                  title={title}
                  onAction={() => open(entry.url)}
                />
              );
            })}
          </MenuBarExtra.Section>
        );
      })}
    </MenuBarExtra>
  );
}
