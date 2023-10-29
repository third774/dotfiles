import { Action, ActionPanel, Detail } from "@raycast/api";
import { useAI } from "@raycast/utils";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { Entry } from "../utils/api";

const prompt = (content: string) =>
  `Summarize the following CONTENT with a brief description and the key takeaways.
  
Format the summary as a markdown document.

CONTENT:
${content}

SUMMARY:
`;

export function DetailSummarized(props: { entry: Entry }) {
  const { data, isLoading } = useAI(prompt(NodeHtmlMarkdown.translate(props.entry.content ?? "")), {
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
        </ActionPanel>
      }
    />
  );
}
