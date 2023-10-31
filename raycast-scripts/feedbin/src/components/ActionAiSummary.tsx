import {
  AI,
  Action,
  ActionPanel,
  Detail,
  Icon,
  environment,
} from "@raycast/api";
import { useAI } from "@raycast/utils";
import parse from "node-html-parser";
import {
  FeedbinApiContextProvider,
  useFeedbinApiContext,
} from "../utils/FeedbinApiContext";
import { Entry } from "../utils/api";
import { ActionCopyUrlToClipboard } from "./ActionCopyUrlToClipboard";
import { ActionMarkAsRead } from "./ActionMarkAsRead";
import { ActionShowEntry } from "./ActionShowEntry";
import { ActionStarToggle } from "./ActionStarToggle";
import { ActionViewSubscription } from "./ActionViewSubscription";

export interface ActionAiSummaryProps {
  entry: Entry;
}

export function ActionAiSummary(props: ActionAiSummaryProps) {
  if (!props.entry.content || !environment.canAccess(AI)) {
    return null;
  }

  return (
    <Action.Push
      title="Summarize"
      icon={Icon.Stars}
      target={
        <FeedbinApiContextProvider>
          <DetailSummarized entry={props.entry} />
        </FeedbinApiContextProvider>
      }
      shortcut={{
        key: "s",
        modifiers: ["cmd", "shift"],
      }}
    />
  );
}

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

export function DetailSummarized(props: { entry: Entry }) {
  // strip content down to text because some posts may contain
  // tons of links which may eat into the 10k character limit
  const content = parse(props.entry.content ?? "").textContent;
  const promptText = prompt(content.substring(0, 9999 - promptLength));
  const { data, isLoading } = useAI(promptText, {
    creativity: 0,
    execute: props.entry.content !== null,
  });

  const { subscriptionMap } = useFeedbinApiContext();

  return (
    <Detail
      markdown={data}
      isLoading={isLoading}
      navigationTitle={
        props.entry.title ?? props.entry.summary ?? props.entry.url
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={props.entry.url} />
          <ActionShowEntry entry={props.entry} />
          <ActionCopyUrlToClipboard url={props.entry.url} />
          <ActionViewSubscription
            feedName={subscriptionMap[props.entry.feed_id]?.title}
            entry={props.entry}
          />
          <ActionStarToggle id={props.entry.id} />
          <ActionMarkAsRead id={props.entry.id} />
        </ActionPanel>
      }
    />
  );
}
