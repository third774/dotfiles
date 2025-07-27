#!/usr/bin/env node

import { readInput, parseHookEvent } from "./shared/input.js";
import { sendNotification, announceVoice } from "./shared/notifications.js";
import { logMessage } from "./shared/logger.js";
import { NotificationEvent } from "./shared/types.js";

function sanitizeMessage(message: string): string {
  return message
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .substring(0, 500); // Truncate to reasonable length
}

function extractToolName(message: string): string {
  const toolMatch = message.match(/Claude needs your permission to use (.+)/);
  if (toolMatch) {
    return toolMatch[1].replace(/[^a-zA-Z0-9 ._-]/g, "").substring(0, 100);
  }
  return "";
}

async function handleNotification(event: NotificationEvent): Promise<void> {
  const message = sanitizeMessage(event.message);

  if (!message) {
    logMessage("WARNING", "No message in Notification event");
    return;
  }

  if (message.includes("Claude needs your permission to use")) {
    // Permission request notification
    const tool = extractToolName(message);
    const notificationText = `Permission needed for: ${tool}`;
    const voiceText = `Claude needs permission for ${tool}`;

    sendNotification(notificationText, "Claude Code");
    announceVoice(voiceText);
  } else if (message.includes("Claude is waiting for your input")) {
    // Idle notification
    const notificationText = "Claude is waiting for your input";
    const voiceText = "Claude is waiting for input";

    sendNotification(notificationText, "Claude Code Idle");
    announceVoice(voiceText);
  } else {
    // Other notification types
    sendNotification(message, "Claude Code");
    announceVoice(message);
  }
}

async function main(): Promise<void> {
  try {
    const input = await readInput();
    const event = parseHookEvent(input);

    if (!event) {
      process.exit(0);
    }

    if (event.hook_event_name === "Notification") {
      await handleNotification(event as NotificationEvent);
    } else {
      logMessage("WARNING", `Unexpected event type: ${event.hook_event_name}`);
    }
  } catch (error) {
    logMessage("ERROR", `Failed to process notification: ${error}`);
  }

  process.exit(0);
}

main();
