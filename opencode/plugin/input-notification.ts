import type { Plugin } from "@opencode-ai/plugin";

/**
 * Plugin that sends macOS notifications when OpenCode is waiting for user input.
 *
 * Listens to the session.idle event and triggers:
 * - A macOS notification banner
 * - A voice announcement via the `say` command
 *
 * Only notifies for parent sessions, not child/subagent sessions.
 */
export const InputNotificationPlugin: Plugin = async ({ $, client }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        try {
          // Fetch session details to check if it's a child session
          const { data: session } = await client.session.get({
            path: { id: event.properties.sessionID },
          });

          // Only notify for parent sessions (no parentID = main session)
          if (session?.parentID) {
            return;
          }

          // Send macOS notification banner
          await $`osascript -e 'display notification "OpenCode is waiting for your input" with title "OpenCode"'`;

          // Voice announcement for audio feedback
          await $`say "OpenCode is waiting for input"`;
        } catch (error) {
          console.error("Failed to send notification:", error);
        }
      }
    },
  };
};
