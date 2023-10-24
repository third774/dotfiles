import { EntryList } from "./components/EntryList";
import { useEntries } from "./utils/api";

export default function Command() {
  const { isLoading: isLoadingEntries, data } = useEntries();
  return <EntryList isLoading={isLoadingEntries} entries={data} />;
}
