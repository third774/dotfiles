import { Clipboard, Toast, showToast } from "@raycast/api";

export default async function JSONStringify() {
  const { text } = await Clipboard.read();
  try {
    const func = `return JSON.stringify(${text})`;
    console.log(func, text);

    const getResult = new Function(func);
    const result = getResult();
    Clipboard.copy(result);
    showToast({
      title: `Copied ${result}`,
      style: Toast.Style.Success,
    });

    return;
  } catch (error) {
    console.log(error);

    showToast({
      title: "Unable to stringify",
      style: Toast.Style.Failure,
    });
  }
}
