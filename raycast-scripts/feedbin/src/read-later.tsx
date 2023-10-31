import { getSelectedText, showToast, Toast } from "@raycast/api";
import { readLater } from "./utils/api";

export default async function Main() {
  let url: string | null;

  try {
    url = await getSelectedText();
  } catch (error) {
    await showToast(Toast.Style.Failure, "Unable to get selected text");
    return;
  }

  try {
    new URL(url);
  } catch {
    await showToast(Toast.Style.Failure, "Selected text is not a valid URL");
    return;
  }

  try {
    await showToast(Toast.Style.Animated, `Saving ${url}`);
    const entry = await readLater(url);
    if (entry && entry.id) {
      await showToast(
        Toast.Style.Success,
        `Saved ${entry.title} to read later`,
      );
    } else {
      await showToast(Toast.Style.Failure, "Failed to save to read later");
    }
  } catch (error) {
    await showToast(Toast.Style.Failure, "Unable to reach Feedbin API");
  }
}
