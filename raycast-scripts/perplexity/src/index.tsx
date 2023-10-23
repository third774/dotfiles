import { Action, ActionPanel, Form, open, popToRoot } from "@raycast/api";

type Values = {
  query: string;
  copilot: boolean;
};

export default function Command() {
  function handleSubmit({ query: q, copilot }: Values) {
    const params = new URLSearchParams({
      q,
      copilot: copilot.toString(),
    });
    popToRoot();
    open(`https://www.perplexity.ai/search?${params}`);
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="Where knowledge begins" />
      <Form.TextArea id="query" title="Ask anything..." autoFocus />
      <Form.Separator />
      <Form.Checkbox id="copilot" title="Checkbox" label="Co-pilot" storeValue />
    </Form>
  );
}
