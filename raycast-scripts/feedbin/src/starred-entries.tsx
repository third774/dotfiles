import { EntryList } from "./components/EntryList";
import { useStarredEntries } from "./utils/api";

export default function Command(): JSX.Element {
  const { data, isLoading } = useStarredEntries();

  return <EntryList isLoading={isLoading} entries={data} />;
}
