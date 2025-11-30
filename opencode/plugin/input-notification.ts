import type { Plugin } from "@opencode-ai/plugin";

/**
 * Plugin that sends macOS notifications when OpenCode is waiting for user input.
 *
 * Listens to the session.idle event and triggers:
 * - A macOS notification banner
 * - A voice announcement via the `say` command
 */
export const InputNotificationPlugin: Plugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      // Trigger notification when OpenCode is idle (waiting for input)
      if (event.type === "session.idle") {
        try {
          // Send macOS notification banner
          await $`osascript -e 'display notification "OpenCode is waiting for your input" with title "OpenCode"'`;

          // Voice announcement for audio feedback
          await $`say "OpenCode is waiting for input"`;
        } catch (error) {
          // Silently fail if notifications aren't available
          console.error("Failed to send notification:", error);
        }
      }
    },
  };
};
