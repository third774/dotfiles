import { EntryList } from "./components/EntryList";
import { useEntries } from "./utils/api";

export default function Command() {
  const {
    isLoading: isLoadingEntries,
    data: entries,
    mutate,
  } = useEntries({
    read: "false",
  });

  return (
    <EntryList
      isLoading={isLoadingEntries}
      entries={entries}
      markEntryReadMutation={async (promise, entryId) => {
        return mutate(promise, {
          optimisticUpdate: (data) => data?.filter((e) => e.id !== entryId),
          rollbackOnError: () => entries,
        });
      }}
    />
  );
}
