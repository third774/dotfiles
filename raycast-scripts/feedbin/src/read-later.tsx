import { getSelectedText, Toast } from "@raycast/api";
import { readLater } from "./utils/api";
import { closeAndShowToast } from "./utils/closeAndShowToast";
import { isValidURL } from "./utils/isValidURL";

export default async function Main() {
  let url: string | null;

  try {
    url = await getSelectedText();
  } catch (error) {
    await closeAndShowToast(Toast.Style.Failure, "Unable to get selected text");
    return;
  }

  if (!isValidURL(url)) {
    await closeAndShowToast(
      Toast.Style.Failure,
      "Selected text is not a valid URL",
    );
    return;
  }

  try {
    await closeAndShowToast(Toast.Style.Animated, `Saving ${url}`);
    const entry = await readLater(url);
    if (entry && entry.id) {
      await closeAndShowToast(
        Toast.Style.Success,
        `Saved ${entry.url} to Read Later`,
      );
    } else {
      await closeAndShowToast(
        Toast.Style.Failure,
        "Failed to save to read later",
      );
    }
  } catch (error) {
    await closeAndShowToast(Toast.Style.Failure, "Unable to reach Feedbin API");
  }
}
