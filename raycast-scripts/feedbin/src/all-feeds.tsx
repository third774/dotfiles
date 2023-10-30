import { EntryList } from "./components/EntryList";
import { useEntries } from "./utils/api";

export default function Command() {
  const { isLoading: isLoadingEntries, data, revalidate } = useEntries();
  return <EntryList isLoading={isLoadingEntries} entries={data} revalidate={revalidate} />;
}
