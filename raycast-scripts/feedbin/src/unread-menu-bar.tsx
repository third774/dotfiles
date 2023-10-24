import { MenuBarExtra, open, updateCommandMetadata } from "@raycast/api";
import { useEffect } from "react";
import { useEntries } from "./utils/api";

export default function MenuCommand(): JSX.Element {
  const { isLoading, data } = useEntries({ read: "false" });

  useEffect(() => {
    (async () => {
      await updateCommandMetadata({ subtitle: `${data?.length.toString() ?? ""} items` });
    })();
  }, []);

  return (
    <MenuBarExtra title={`🍔 ${data?.length.toString() ?? "0"} unread`} isLoading={isLoading}>
      <MenuBarExtra.Section title="Feedbin Unread Items" />
      {data?.length === 0 && <MenuBarExtra.Section title="No Unread Items" />}
      {data?.map((entry) => (
        <MenuBarExtra.Item key={entry.id} title={entry.title ?? entry.summary} onAction={() => open(entry.url)} />
      ))}
    </MenuBarExtra>
  );
}
