import { Action, ActionPanel, List, popToRoot } from "@raycast/api";
import { useEffect, useState } from "react";
import { getClipboardUrl } from "./utils";

export default function GrabUrlPartFromSelection() {
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

  const fragments = url.pathname.split("/").filter(Boolean);

  return (
    <List>
      {fragments.map((fragment, i) => (
        <List.Item
          key={i}
          title={fragment}
          actions={
            <ActionPanel>
              <Action.Paste content={fragment} />
              <Action.CopyToClipboard content={fragment} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
