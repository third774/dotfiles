import { useFeedEntries } from "../utils/api";
import { EntryList } from "./EntryList";

export function FeedList(props: { feedId: number }) {
  const { data, isLoading, mutate } = useFeedEntries(props.feedId);
  return <EntryList entries={data} isLoading={isLoading} mutateEntries={mutate} />;
}
