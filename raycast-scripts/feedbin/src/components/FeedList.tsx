import { useFeedEntries } from "../utils/api";
import { EntryList } from "./EntryList";

export function FeedList(props: { feedId: number; navigationTitle?: string }) {
  const { data, revalidate, mutate, isLoading } = useFeedEntries(props.feedId);
  return (
    <EntryList
      entries={data}
      mutateEntries={mutate}
      revalidateEntries={revalidate}
      navigationTitle={props.navigationTitle}
      isLoading={isLoading}
    />
  );
}
