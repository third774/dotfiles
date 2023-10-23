import { Clipboard, Toast, getSelectedText, showToast } from "@raycast/api";
import { useState, useEffect } from "react";

export function useSelectedText() {
  const [text, setText] = useState<string>();

  useEffect(() => {
    getSelectedText().then((text) => {
      setText(text);
    });
  }, []);

  return text;
}

export function parseUrl(str: string) {
  try {
    return new URL(str);
  } catch {
    return null;
  }
}

export async function getClipboardUrl() {
  const clipboardText = await Clipboard.readText();

  if (clipboardText === undefined) {
    showToast({
      style: Toast.Style.Failure,
      title: "Clipboard is empty",
    });
    return;
  }

  const url = parseUrl(clipboardText);
  if (url === null) {
    showToast({
      style: Toast.Style.Failure,
      title: "Invalid URL in Clipboard",
      message: clipboardText,
    });
    return;
  }

  return url;
}
