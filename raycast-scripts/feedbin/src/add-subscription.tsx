import {
  Action,
  ActionPanel,
  Form,
  Toast,
  getSelectedText,
  showToast,
  useNavigation,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { MultipleFeeds, createSubscription } from "./utils/api";
import { closeAndShowToast } from "./utils/closeAndShowToast";
import { isValidURL } from "./utils/isValidURL";

function AddMultipleFeeds(props: { feeds: MultipleFeeds }) {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            onSubmit={async (values: Record<string, boolean>) => {
              const feeds = Object.entries(values)
                .filter(([, value]) => value)
                .map(([key]) => key);
              showToast(
                Toast.Style.Animated,
                `Subscribing to ${feeds.length} feed${
                  feeds.length === 1 ? "" : "s"
                }...`,
              );

              await Promise.all(feeds.map((key) => createSubscription(key)));
              closeAndShowToast(
                Toast.Style.Success,
                feeds.length === 1
                  ? `Subscribed to ${feeds[0]}`
                  : `Subscribed to ${feeds.length} feeds`,
              );
            }}
          />
        </ActionPanel>
      }
    >
      {props.feeds.map(({ feed_url, title }) => (
        <Form.Checkbox
          key={feed_url}
          defaultValue={true}
          id={feed_url}
          label={feed_url}
          title={title}
        />
      ))}
    </Form>
  );
}

export default function Command(): JSX.Element {
  const { push } = useNavigation();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const text = await getSelectedText();
        if (!isValidURL(text)) {
          closeAndShowToast(Toast.Style.Failure, "Invalid URL selected");
          return;
        }

        showToast(Toast.Style.Animated, "Checking for feeds...");
        const result = await createSubscription(text);
        setIsLoading(false);
        if (Array.isArray(result)) {
          showToast(Toast.Style.Success, "Multiple feeds found");
          push(<AddMultipleFeeds feeds={result} />);
          return;
        } else if ("feed_url" in result) {
          closeAndShowToast(
            Toast.Style.Success,
            `Subscribed to ${result.feed_url}`,
          );
          return;
        } else if (result.status === 404) {
          closeAndShowToast(Toast.Style.Failure, "No feeds found");
          return;
        } else {
          closeAndShowToast(Toast.Style.Failure, "Unknown error");
          return;
        }
      } catch (error) {
        closeAndShowToast(Toast.Style.Failure, "Unable to get selected text");
      }
    })();
  }, []);

  return <Form isLoading={isLoading} />;
}