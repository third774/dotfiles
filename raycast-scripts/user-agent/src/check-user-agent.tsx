import { Clipboard, Detail, getSelectedText } from "@raycast/api";
import { useState, useEffect } from "react";
import UAParser from "ua-parser-js";

export default function CheckUserAgent() {
  const [input, setInput] = useState<string>();

  useEffect(() => {
    (async () => {
      const data = (await getSelectedText()) || (await Clipboard.readText());
      setInput(data);
    })();
  }, []);

  const parser = new UAParser(input);
  const parserResults = parser.getResult();

  return (
    <Detail
      isLoading={input === undefined}
      markdown={input}
      metadata={
        <Detail.Metadata>
          {parserResults.device.model && (
            <Detail.Metadata.Label title="Device Model" text={parserResults.device.model} />
          )}
          {parserResults.device.type && <Detail.Metadata.Label title="Device Type" text={parserResults.device.type} />}
          {parserResults.device.vendor && (
            <Detail.Metadata.Label title="Device Vendor" text={parserResults.device.vendor} />
          )}
          <Detail.Metadata.Separator />
          {parserResults.os.name && <Detail.Metadata.Label title="OS Name" text={parserResults.os.name} />}
          {parserResults.os.version && <Detail.Metadata.Label title="OS Version" text={parserResults.os.version} />}
          <Detail.Metadata.Separator />
          {parserResults.browser.name && (
            <Detail.Metadata.Label title="Browser Name" text={parserResults.browser.name} />
          )}
          {parserResults.browser.version && (
            <Detail.Metadata.Label title="Browser Version" text={parserResults.browser.version} />
          )}
          <Detail.Metadata.Separator />
          {parserResults.engine.name && <Detail.Metadata.Label title="Engine Name" text={parserResults.engine.name} />}
          {parserResults.engine.version && (
            <Detail.Metadata.Label title="Engine Version" text={parserResults.engine.version} />
          )}
          <Detail.Metadata.Separator />
          {parserResults.cpu.architecture && (
            <Detail.Metadata.Label title="CPU Architecture" text={parserResults.cpu.architecture} />
          )}
        </Detail.Metadata>
      }
    />
  );
}
