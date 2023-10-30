import { AI, Action, ActionPanel, Icon, LaunchType, List, environment, launchCommand } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { ReactNode, useState } from "react";
import {
  Entry,
  Subscription,
  deleteStarredEntries,
  markAsRead,
  starEntries,
  useIcons,
  useStarredEntriesSet,
  useSubscriptionMap,
  useUnreadEntriesIdSet,
} from "../utils/api";
import { ActionShowEntry } from "./ActionShowEntry";
import { DetailSummarized } from "./DetailSummarized";
import { FeedList } from "./FeedList";

function getHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export interface EntryListProps {
  isLoading: boolean;
  entries?: Entry[];
  revalidate?: () => void;
  mutateEntries?: MutatePromise<Entry[] | undefined, Entry[] | undefined, unknown>;
}

const ReadSection = (props: { prioritizeUnread: boolean; children: ReactNode }) =>
  props.prioritizeUnread ? <List.Section title="Read">{props.children}</List.Section> : <>{props.children}</>;

export function EntryList(props: EntryListProps) {
  const { isLoading: isLoadingSubscriptions, data: subscriptionMap } = useSubscriptionMap();
  const { isLoading: isLoadingIcons, data: icons } = useIcons();
  const { isLoading: isLoadingStarredEntries } = useStarredEntriesSet();
  const {
    isLoading: isLoadingUnreadEntriesSet,
    data: unreadEntriesSet,
    mutate: mutateUnreadEntriesSet,
  } = useUnreadEntriesIdSet();
  const { data: starredEntriesSet, mutate: mutateStarredEntries } = useStarredEntriesSet();
  const [prioritizeUnread, setPrioritizeUnread] = useState(true);

  const unreadItems = props.entries?.filter((entry) => unreadEntriesSet.has(entry.id));

  return (
    <List
      searchBarAccessory={
        <List.Dropdown
          defaultValue={prioritizeUnread.toString()}
          storeValue
          tooltip="Option to prioritize unread entries"
          onChange={(value) => {
            console.log({ value });

            return setPrioritizeUnread(value === "true");
          }}
        >
          <List.Dropdown.Item title="Prioritize Unread" value="true" />
          <List.Dropdown.Item title="Show All in Order" value="false" />
        </List.Dropdown>
      }
      isLoading={
        props.isLoading ||
        isLoadingSubscriptions ||
        isLoadingStarredEntries ||
        isLoadingUnreadEntriesSet ||
        isLoadingIcons
      }
    >
      {props.entries && props.entries.length === 0 && <List.EmptyView icon={Icon.CheckRosette} title="No content!" />}

      {prioritizeUnread && (
        <>
          <List.Section title="Unread">
            {unreadItems && unreadItems.length === 0 && (
              <List.Item
                actions={
                  <ActionPanel>
                    {props.revalidate && (
                      <Action title="Refresh" icon={Icon.RotateClockwise} onAction={() => props.revalidate?.()} />
                    )}
                  </ActionPanel>
                }
                title="No Unread Items"
              />
            )}
            {subscriptionMap &&
              unreadEntriesSet &&
              unreadItems?.map((entry) => (
                <ListItem
                  key={entry.id}
                  entry={entry}
                  mutateEntries={props.mutateEntries}
                  icons={icons}
                  subscriptionMap={subscriptionMap}
                  mutateStarredEntries={mutateStarredEntries}
                  mutateUnreadEntriesSet={mutateUnreadEntriesSet}
                  starredEntriesSet={starredEntriesSet}
                  unreadEntriesSet={unreadEntriesSet}
                />
              ))}
          </List.Section>
        </>
      )}

      <ReadSection prioritizeUnread={prioritizeUnread}>
        {subscriptionMap &&
          unreadEntriesSet &&
          props.entries
            ?.filter((entry) => (prioritizeUnread ? !unreadEntriesSet.has(entry.id) : true))
            .map((entry) => (
              <ListItem
                key={entry.id}
                entry={entry}
                mutateEntries={props.mutateEntries}
                icons={icons}
                subscriptionMap={subscriptionMap}
                mutateStarredEntries={mutateStarredEntries}
                mutateUnreadEntriesSet={mutateUnreadEntriesSet}
                starredEntriesSet={starredEntriesSet}
                unreadEntriesSet={unreadEntriesSet}
              />
            ))}
      </ReadSection>
    </List>
  );
}

function ListItem({
  entry,
  mutateEntries,
  subscriptionMap,
  mutateStarredEntries,
  mutateUnreadEntriesSet,
  icons,
  starredEntriesSet,
  unreadEntriesSet,
}: {
  entry: Entry;
  mutateEntries?: MutatePromise<Entry[] | undefined, Entry[] | undefined, unknown>;
  subscriptionMap: Record<number, Subscription>;
  mutateStarredEntries: MutatePromise<number[] | undefined, number[] | undefined, unknown>;
  mutateUnreadEntriesSet: MutatePromise<number[] | undefined, number[] | undefined, unknown>;
  starredEntriesSet: Set<number>;
  unreadEntriesSet: Set<number>;
  icons: Record<string, string>;
}) {
  const host = getHost(entry.url);
  return (
    <List.Item
      key={entry.id}
      title={entry.title ?? entry.summary}
      icon={(host && icons[host]) || Icon.Globe}
      keywords={(subscriptionMap[entry.feed_id]?.title ?? entry.url).split(" ")}
      subtitle={subscriptionMap[entry.feed_id]?.title ?? entry.url}
      accessories={[
        starredEntriesSet.has(entry.id) && {
          icon: Icon.Star,
        },
        unreadEntriesSet.has(entry.id) && {
          icon: Icon.Tray,
        },
      ].filter(Boolean)}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={entry.url} />
          <ActionShowEntry entry={entry} />
          {entry.content && environment.canAccess(AI) && (
            <Action.Push
              title="Summarize"
              icon={Icon.Stars}
              target={<DetailSummarized entry={entry} mutateUnreadEntriesSet={mutateUnreadEntriesSet} />}
              shortcut={{
                key: "s",
                modifiers: ["cmd", "shift"],
              }}
            />
          )}
          <Action.CopyToClipboard
            title="Copy URL to Clipboard"
            content={entry.url}
            shortcut={{
              key: "c",
              modifiers: ["cmd", "shift"],
            }}
          />
          <Action.Push title="View Subscription" icon={Icon.Livestream} target={<FeedList feedId={entry.feed_id} />} />
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
                const pendingMutation = mutateUnreadEntriesSet(markAsRead(entry.id));
                await (mutateEntries
                  ? mutateEntries(pendingMutation, {
                      optimisticUpdate: (entries) => entries?.filter((e) => e.id !== entry.id),
                    })
                  : pendingMutation);
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
  );
}
