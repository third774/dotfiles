import { getSelectedText, showToast, Toast } from "@raycast/api";
import { readLater } from "./utils/api";

export default async function Main() {
  const url = await getSelectedText();
  try {
    const entry = await readLater(url);
    if (entry && entry.id) {
      await showToast(Toast.Style.Success, `Saved ${entry.title} to read later`);
    } else {
      await showToast(Toast.Style.Failure, "Failed to Save to Read Later");
    }
  } catch (error) {
    await showToast(Toast.Style.Failure, "Unable to Reach Feedbin API");
  }
}
