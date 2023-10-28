import { EntryList } from "./components/EntryList";
import { useEntries } from "./utils/api";

export default function Command() {
  const {
    isLoading: isLoadingEntries,
    data: entries,
    revalidate,
    mutate,
  } = useEntries({
    read: "false",
  });

  return <EntryList mutateEntries={mutate} isLoading={isLoadingEntries} entries={entries} revalidate={revalidate} />;
}
