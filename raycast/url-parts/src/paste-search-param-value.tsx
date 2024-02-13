import { Action, ActionPanel, List, popToRoot } from "@raycast/api";
import { useEffect, useState } from "react";
import { getClipboardUrl } from "./utils";

export default function PasteSearchParamValue() {
  const [url, setUrl] = useState<URL>();
  const [noUrl, setNoUrl] = useState(false);

  useEffect(() => {
    getClipboardUrl().then((url) => {
      if (url) {
        setUrl(url);
      } else {
        setNoUrl(true);
      }
    });
  }, []);

  useEffect(() => {
    if (noUrl) popToRoot({ clearSearchBar: false });
  }, [noUrl]);

  if (noUrl) {
    return null;
  }
  if (url === undefined) return <List isLoading></List>;

  const paramEntries = [...url.searchParams.entries()];

  return (
    <List>
      {paramEntries.map(([key, value], i) => (
        <List.Item
          key={i}
          title={value}
          subtitle={"?" + key + "="}
          keywords={[key, "?" + key + "="]}
          actions={
            <ActionPanel>
              <Action.Paste content={value} />
              <Action.CopyToClipboard content={value} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
