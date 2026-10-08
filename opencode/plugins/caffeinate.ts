import { Plugin } from "@opencode/plugin";
import type { Subprocess } from "bun";

export default Plugin.define({
  id: "caffeinate",
  setup(ctx) {
    if (process.platform !== "darwin") return;

    const busySessions = new Set<string>();
    const controller = new AbortController();
    let caffeinateProc: Subprocess | undefined;
    let starting = false;

    const log = (message: string) => console.info(`[caffeinate] ${message}`);

    const startCaffeinate = () => {
      if (caffeinateProc || starting) return;
      starting = true;
      try {
        caffeinateProc = Bun.spawn(["caffeinate", "-i"], {
          stdout: "ignore",
          stderr: "ignore",
        });
        log("preventing system sleep");
      } catch (error) {
        log(`failed to start caffeinate: ${String(error)}`);
      } finally {
        starting = false;
      }
    };

    const stopCaffeinate = () => {
      if (!caffeinateProc) return;
      caffeinateProc.kill();
      caffeinateProc = undefined;
      log("allowing system sleep");
    };

    void (async () => {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
        if (event.type !== "session.status") continue;

        const { sessionID, status } = event.data;

        if (status.type === "idle") {
          busySessions.delete(sessionID);
          if (busySessions.size === 0) stopCaffeinate();
          continue;
        }

        const wasEmpty = busySessions.size === 0;
        busySessions.add(sessionID);
        if (wasEmpty) {
          startCaffeinate();
        }
      }
    })().catch((error) => {
      if (!controller.signal.aborted) {
        log(`event subscription failed: ${String(error)}`);
      }
    });

    return () => {
      controller.abort();
      stopCaffeinate();
    };
  },
});
