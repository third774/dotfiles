import { Action, ActionPanel, Form, LaunchProps, getPreferenceValues } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { useEffect } from "react";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

export default function Command(
  props: LaunchProps<{
    arguments: Arguments.ShareLinkToBlog;
  }>,
) {
  const { API_TOKEN } = getPreferenceValues<Preferences.ShareLinkToBlog>();

  const { handleSubmit, itemProps, values, setValue } = useForm({
    onSubmit(values) {
      const body: Record<string, string> = { ...values };

      if (!values.remarks) {
        delete body.remarks;
      }

      fetch("https://kevinkipp.com/api/private/linkShare", {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
    },
    initialValues: {
      url: props.arguments.url ?? "",
      remarks: "",
      title: "",
    },
    validation: {
      url: (value) => {
        if (!value) {
          return "URL is required";
        }
        if (!URL.canParse(value)) {
          return "Invalid URL";
        }
        return undefined;
      },
      title: (value) => {
        if (!value) {
          return "Title is required";
        }
        return undefined;
      },
    },
  });

  useEffect(() => {
    if (!values.url) return;

    fetch(values.url)
      .then((res) => res.text())
      .then((document) => {
        const $ = cheerio.load(document);
        let title = $("title").text();
        if (!title) {
          title = $("meta[property='og:title']").attr("content") ?? "";
        }
        if (!title) {
          title = $("h1").text();
        }
        if (!title) {
          title = $("h2").text();
        }
        setValue("title", title);
      });
  }, [values.url]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Share" onSubmit={handleSubmit}></Action.SubmitForm>
        </ActionPanel>
      }
    >
      <Form.TextField {...itemProps.url} title="URL" />
      <Form.TextField {...itemProps.title} title="Title" />
      <Form.TextArea {...itemProps.remarks} title="Remarks" />
    </Form>
  );
}
