import {
  Action,
  ActionPanel,
  Form,
  LaunchProps,
  PopToRootType,
  Toast,
  closeMainWindow,
  getPreferenceValues,
  showToast,
} from "@raycast/api";
import { useForm } from "@raycast/utils";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { useEffect, useState } from "react";

export default function Command(
  props: LaunchProps<{
    arguments: Arguments.ShareLinkToBlog;
  }>,
) {
  const [submitting, setSubmitting] = useState(false);
  const { API_TOKEN } = getPreferenceValues<Preferences.ShareLinkToBlog>();

  const { handleSubmit, itemProps, values, setValue, focus } = useForm({
    onSubmit(values) {
      const body: Record<string, string> = { ...values };

      if (!values.remarks) {
        delete body.remarks;
      }

      setSubmitting(true);
      fetch("https://kevinkipp.com/api/private/linkShare", {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
      })
        .then(() => {
          closeMainWindow({
            clearRootSearch: true,
            popToRootType: PopToRootType.Immediate,
          });
          showToast(Toast.Style.Success, `Shared ${values.title ? values.title : "link"}`);
        })
        .catch((error) => {
          console.error(error);
          showToast(Toast.Style.Failure, "Failed to share link");
        })
        .finally(() => {
          setSubmitting(false);
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
        focus("title");
      });
  }, [values.url]);

  return (
    <Form
      isLoading={submitting}
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
