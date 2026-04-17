import type { Plugin } from "@opencode-ai/plugin";

/**
 * Plugin that sends macOS notifications when OpenCode is waiting for user input.
 *
 * Listens to user-attention events and triggers:
 * - A macOS notification banner
 * - A voice announcement via the `say` command
 *
 * Only notifies for parent sessions, not child/subagent sessions.
 */

export const InputNotificationPlugin: Plugin = async ({ $, client }) => {
  return {
    event: async ({ event }) => {
      const isSessionIdle = event.type === "session.idle";
      const isPermissionRequest = event.type === "permission.asked";

      if (isSessionIdle || isPermissionRequest) {
        try {
          // Fetch session details to check if it's a child session
          const { data: session } = await client.session.get({
            path: { id: event.properties.sessionID },
          });

          // Only notify for parent sessions (no parentID = main session)
          if (session?.parentID) {
            return;
          }

          if (isPermissionRequest) {
            // Send macOS notification banner
            await $`osascript -e 'display notification "OpenCode needs your permission" with title "OpenCode"'`;

            // Voice announcement for audio feedback (suppress stderr diagnostics)
            await $`say -v Samantha "OpenCode needs your permission" 2>/dev/null`;
            return;
          }

          // Send macOS notification banner
          await $`osascript -e 'display notification "OpenCode is waiting for your input" with title "OpenCode"'`;

          // Voice announcement for audio feedback (suppress stderr diagnostics)
          await $`say -v Samantha "OpenCode is waiting for input" 2>/dev/null`;
        } catch (error) {
          console.error("Failed to send notification:", error);
        }
      }
    },
  };
};
