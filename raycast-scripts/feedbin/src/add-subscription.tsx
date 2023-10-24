import { Action, ActionPanel, Form, popToRoot, showToast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { MultipleFeeds, createSubscription } from "./utils/api";

function AddMultipleFeeds(props: { feeds: MultipleFeeds }) {
  const [isLoading, setIsloading] = useState(false);
  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            onSubmit={async (values: Record<string, boolean>) => {
              setIsloading(true);
              const feeds = Object.entries(values)
                .filter(([, value]) => value)
                .map(([key]) => key);
              await Promise.all(feeds.map((key) => createSubscription(key)));
              setIsloading(false);
              showToast({
                title: `Added ${feeds.length} feed${feeds.length === 1 ? "" : "s"}.`,
              });
              popToRoot();
            }}
          />
        </ActionPanel>
      }
    >
      {props.feeds.map(({ feed_url, title }) => (
        <Form.Checkbox key={feed_url} defaultValue={true} id={feed_url} label={title} />
      ))}
    </Form>
  );
}

export default function Command(): JSX.Element {
  const { push } = useNavigation();
  const [isLoading, setIsloading] = useState(false);

  async function handleSubmit(values: { URI: string }) {
    setIsloading(true);
    const result = await createSubscription(values.URI);
    setIsloading(false);
    if (Array.isArray(result)) {
      push(<AddMultipleFeeds feeds={result} />);
    } else {
      showToast({ title: `Added ${result.feed_url}` });
      popToRoot();
    }
  }
  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField autoFocus id="URI" title="RSS or URL" />
    </Form>
  );
}
