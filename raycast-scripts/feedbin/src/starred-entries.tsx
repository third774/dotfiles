import { EntryList } from "./components/EntryList";
import {
  FeedbinApiContextProvider,
  useFeedbinApiContext,
} from "./utils/FeedbinApiContext";

function StarredEntries() {
  const { starredEntries, starredEntriesIdsSet } = useFeedbinApiContext();
  return (
    <EntryList
      entries={starredEntries.data?.filter((entry) =>
        starredEntriesIdsSet.has(entry.id),
      )}
      revalidateEntries={starredEntries.revalidate}
      mutateEntries={starredEntries.mutate}
      isLoading={starredEntries.isLoading}
    />
  );
}

export default function Command(): JSX.Element {
  return (
    <FeedbinApiContextProvider>
      <StarredEntries />
    </FeedbinApiContextProvider>
  );
}
