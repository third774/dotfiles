import { Clipboard, Toast, showToast } from "@raycast/api";
import { getClipboardUrl } from "./utils";

export default async function Command() {
  const url = await getClipboardUrl();
  if (url === undefined) return;

  const [lastPathSegment] = url.pathname.split("/").reverse();

  if (lastPathSegment === undefined) {
    showToast({
      style: Toast.Style.Failure,
      title: "No fragments in URL",
    });
    return;
  }

  Clipboard.paste(lastPathSegment);
}
