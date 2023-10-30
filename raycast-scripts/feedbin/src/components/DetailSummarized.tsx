import { Action, ActionPanel, Detail, LaunchType, launchCommand, useNavigation } from "@raycast/api";
import { MutatePromise, useAI } from "@raycast/utils";
import { Entry, markAsRead } from "../utils/api";
import { parse } from "node-html-parser";
import { ActionShowEntry } from "./ActionShowEntry";

const prompt = (content: string) =>
  `INSTRUCTIONS:
---
Summarize the CONTENT below with a brief description and short list of key points using the FORMAT below:
---

FORMAT:
---
### Description
[Description of the content]

### Key Points
- [Key point 1]
- [Key point 2]
- [Key point 3]
---

---
CONTENT:
${content}
---

---
SUMMARY:
`;

const promptLength = prompt("").length;

export function DetailSummarized(props: {
  entry: Entry;
  mutateUnreadEntriesSet: MutatePromise<number[] | undefined, number[] | undefined, unknown>;
}) {
  // strip content down to text because some posts may contain
  // tons of links which may eat into the 10k character limit
  const content = parse(props.entry.content ?? "").textContent;
  const promptText = prompt(content.substring(0, 9999 - promptLength));
  const { data, isLoading } = useAI(promptText, {
    creativity: 0,
    execute: props.entry.content !== null,
  });

  const { pop } = useNavigation();

  return (
    <Detail
      markdown={data}
      isLoading={isLoading}
      navigationTitle={props.entry.title ?? props.entry.summary ?? props.entry.url}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={props.entry.url} />
          <ActionShowEntry entry={props.entry} />
          <Action.CopyToClipboard
            shortcut={{
              key: "c",
              modifiers: ["cmd", "shift"],
            }}
            title="Copy URL to Clipboard"
            content={props.entry.url}
          />
          <Action
            title="Mark as Read"
            shortcut={{
              key: "m",
              modifiers: ["cmd"],
            }}
            onAction={async () => {
              await props.mutateUnreadEntriesSet(markAsRead(props.entry.id), {
                optimisticUpdate: (ids) => {
                  console.log("Removing: ", props.entry.id, ids);
                  return ids?.filter((id) => id !== props.entry.id);
                },
              });
              await launchCommand({
                name: "unread-menu-bar",
                type: LaunchType.Background,
              });
              pop();
            }}
          />
        </ActionPanel>
      }
    />
  );
}
