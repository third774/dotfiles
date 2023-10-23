import { Detail, ActionPanel, Action } from "@raycast/api";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { Entry } from "../utils/api";

export interface ShowEntryActionProps {
  entry: Entry;
}

export function ShowEntryAction(props: ShowEntryActionProps) {
  if (props.entry.content === null) return null;
  return (
    <Action.Push
      title="Show Details"
      target={
        <Detail
          markdown={NodeHtmlMarkdown.translate(props.entry.content)}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={props.entry.url} />
              {process.env.NODE_ENV === "development" && (
                <Action.CopyToClipboard title="Copy Entry JSON" content={JSON.stringify(props.entry, null, 2)} />
              )}
            </ActionPanel>
          }
        />
      }
    />
  );
}
