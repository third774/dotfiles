import { Action, ActionPanel, Detail } from "@raycast/api";
import { useAI } from "@raycast/utils";
import { Entry } from "../utils/api";
import { parse } from "node-html-parser";

const prompt = (content: string) =>
  `Summarize the following CONTENT with a brief description and the key takeaways.

Format the summary as a markdown document.

CONTENT:
${content}

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

  return (
    <Detail
      markdown={data}
      isLoading={isLoading}
      navigationTitle={props.entry.title ?? props.entry.summary ?? props.entry.url}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={props.entry.url} />
          <Action.CopyToClipboard content={content} />
        </ActionPanel>
      }
    />
  );
}
