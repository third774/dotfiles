#!/usr/bin/env node

import { readInput, parseHookEvent } from "./shared/input.js";
import { sendNotification, announceVoice } from "./shared/notifications.js";
import { logMessage } from "./shared/logger.js";
import { StopEvent } from "./shared/types.js";

async function handleStop(event: StopEvent): Promise<void> {
  const notificationText = "Task completed successfully";
  const voiceText = "Claude task completed";

  sendNotification(notificationText, "Claude Code Complete", "Glass");
  announceVoice(voiceText);
}

async function main(): Promise<void> {
  try {
    const input = await readInput();
    const event = parseHookEvent(input);

    if (!event) {
      process.exit(0);
    }

    if (event.hook_event_name === "Stop") {
      await handleStop(event as StopEvent);
    } else {
      logMessage("WARNING", `Unexpected event type: ${event.hook_event_name}`);
    }
  } catch (error) {
    logMessage("ERROR", `Failed to process stop event: ${error}`);
  }

  process.exit(0);
}

main();
