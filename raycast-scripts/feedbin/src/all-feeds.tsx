import { EntryList } from "./components/EntryList";
import { FeedbinApiContextProvider } from "./utils/FeedbinApiContext";
import { useEntries } from "./utils/api";

export default function Command() {
  const { data, mutate, revalidate, isLoading } = useEntries();
  return (
    <FeedbinApiContextProvider>
      <EntryList
        entries={data}
        mutateEntries={mutate}
        revalidateEntries={revalidate}
        isLoading={isLoading}
      />
    </FeedbinApiContextProvider>
  );
}
