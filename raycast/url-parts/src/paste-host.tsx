import { Clipboard } from "@raycast/api";
import { getClipboardUrl } from "./utils";

export default async function Command() {
  const url = await getClipboardUrl();
  if (url) {
    Clipboard.paste(url.host);
  }
}
