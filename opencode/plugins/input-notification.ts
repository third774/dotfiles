import { Plugin } from "@opencode/plugin";

/**
 * Sends macOS notifications when OpenCode waits for user input or permission.
 * It ignores child sessions.
 */
export default Plugin.define({
  id: "input-notification",
  setup(ctx) {
    const controller = new AbortController();

    const notify = async (message: string, speech: string): Promise<void> => {
      const notification = Bun.spawn(
        ["osascript", "-e", `display notification ${JSON.stringify(message)} with title "OpenCode"`],
        { stdout: "ignore", stderr: "ignore" },
      );
      await notification.exited;

      const voice = Bun.spawn(["say", "-v", "Samantha", speech], {
        stdout: "ignore",
        stderr: "ignore",
      });
      await voice.exited;
    };

    void (async () => {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
        const isSessionIdle = event.type === "session.idle";
        const isPermissionRequest = event.type === "permission.asked";
        if (!isSessionIdle && !isPermissionRequest) continue;

        try {
          const session = await ctx.session.get({ sessionID: event.data.sessionID });
          if (session.parentID) continue;

          if (isPermissionRequest) {
            await notify("OpenCode needs your permission", "OpenCode needs your permission");
            continue;
          }

          await notify("OpenCode is waiting for your input", "OpenCode is waiting for input");
        } catch (error) {
          console.error("Failed to send notification:", error);
        }
      }
    })().catch((error) => {
      if (!controller.signal.aborted) {
        console.error("Failed to send notification:", error);
      }
    });

    return () => controller.abort();
  },
});
