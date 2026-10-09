import { Plugin } from "@opencode/plugin";
import { existsSync } from "node:fs";
import { appendFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { dirname, resolve, sep } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const SCRATCHPAD_DIRECTORY = "__scratchpad_plugin_sessions";
const SCRATCHPAD_EXCLUDE = `.opencode/${SCRATCHPAD_DIRECTORY}/`;

const INITIAL_TEMPLATE = `# Session Scratch Space

> Keep this file minimal. Brief pointers, not full content.
> Update when you write files so context survives compaction.

## Purpose

(What is this session working on?)

## Files

(List files with one-line descriptions)

## Current State

(Where did things leave off? Next step?)
`;

function getScratchPath(directory: string, sessionID: string): string {
  return resolve(directory, ".opencode", SCRATCHPAD_DIRECTORY, sessionID);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getFilename(input: unknown): string | undefined {
  if (!isRecord(input) || typeof input.filename !== "string") return undefined;
  return input.filename;
}

function getContent(input: unknown): string | undefined {
  if (!isRecord(input) || typeof input.content !== "string") return undefined;
  return input.content;
}

function resolveScratchFile(scratchPath: string, filename: string): string | undefined {
  if (filename.length === 0) return undefined;

  const filePath = resolve(scratchPath, filename);
  if (!filePath.startsWith(`${scratchPath}${sep}`)) return undefined;

  return filePath;
}

function invalidFilename() {
  return { content: "Error: Invalid filename. Path traversal is not allowed." };
}

async function getGitExcludePath(directory: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", directory, "rev-parse", "--path-format=absolute", "--git-common-dir"]);
    const gitDirectory = stdout.trim();
    return gitDirectory.length === 0 ? undefined : resolve(gitDirectory, "info", "exclude");
  } catch {
    return undefined;
  }
}

async function ensureScratchpadIsIgnored(directory: string): Promise<void> {
  const excludePath = await getGitExcludePath(directory);
  if (excludePath === undefined) return;

  await mkdir(dirname(excludePath), { recursive: true });
  const content = existsSync(excludePath) ? await readFile(excludePath, "utf8") : "";
  const hasRule = content.split(/\r?\n/).some((line) => line.trim() === SCRATCHPAD_EXCLUDE);
  if (hasRule) return;

  const separator = content.length === 0 || content.endsWith("\n") ? "" : "\n";
  await appendFile(excludePath, `${separator}${SCRATCHPAD_EXCLUDE}\n`);
}

export default Plugin.define({
  id: "scratchpad",
  async setup(ctx) {
    await ensureScratchpadIsIgnored(ctx.location.directory).catch((error: unknown) =>
      console.error("[scratchpad] could not update Git exclude file", error),
    );

    const createScratchpad = async (sessionID: string): Promise<void> => {
      const scratchPath = getScratchPath(ctx.location.directory, sessionID);
      const indexPath = resolve(scratchPath, "index.md");

      await mkdir(scratchPath, { recursive: true });
      if (!existsSync(indexPath)) await writeFile(indexPath, INITIAL_TEMPLATE);
    };

    const controller = new AbortController();
    void (async () => {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
        if (event.type !== "session.created") continue;
        await createScratchpad(event.data.sessionID);
      }
    })().catch((error: unknown) => console.error("[scratchpad] event subscription failed", error));

    await ctx.session.hook("compaction", async (event) => {
      const scratchPath = getScratchPath(ctx.location.directory, event.sessionID);
      const indexPath = resolve(scratchPath, "index.md");
      if (!existsSync(indexPath)) return;

      const indexContent = await readFile(indexPath, "utf8");
      event.system.push({
        type: "text",
        text: `## Session Scratch Space

${indexContent}

Path: .opencode/${SCRATCHPAD_DIRECTORY}/${event.sessionID}/
Use session_scratch_read to load specific files.`,
      });
    });

    await ctx.tool.transform((editor) => {
      editor.add({
        name: "session_scratch_write",
        description: "Write content to a file in the session scratch space",
        input: {
          type: "object",
          properties: {
            filename: { type: "string", description: "Filename to write, relative to the scratch space" },
            content: { type: "string", description: "File content" },
          },
          required: ["filename", "content"],
          additionalProperties: false,
        },
        async execute(input, context) {
          const filename = getFilename(input);
          const content = getContent(input);
          if (filename === undefined || content === undefined) return invalidFilename();

          const scratchPath = getScratchPath(ctx.location.directory, context.sessionID);
          const filePath = resolveScratchFile(scratchPath, filename);
          if (filePath === undefined) return invalidFilename();

          await mkdir(resolve(filePath, ".."), { recursive: true });
          await writeFile(filePath, content);
          return { content: `Wrote to ${filename}` };
        },
      });

      editor.add({
        name: "session_scratch_read",
        description: "Read a file from the session scratch space",
        input: {
          type: "object",
          properties: {
            filename: { type: "string", description: "Filename to read, relative to the scratch space" },
          },
          required: ["filename"],
          additionalProperties: false,
        },
        async execute(input, context) {
          const filename = getFilename(input);
          if (filename === undefined) return invalidFilename();

          const scratchPath = getScratchPath(ctx.location.directory, context.sessionID);
          const filePath = resolveScratchFile(scratchPath, filename);
          if (filePath === undefined) return invalidFilename();
          if (!existsSync(filePath)) return { content: "File not found." };

          return { content: await readFile(filePath, "utf8") };
        },
      });

      editor.add({
        name: "session_scratch_list",
        description: "List files in the session scratch space",
        input: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        async execute(_input, context) {
          const scratchPath = getScratchPath(ctx.location.directory, context.sessionID);
          if (!existsSync(scratchPath)) return { content: "No scratch space exists yet." };

          const files = await readdir(scratchPath, { recursive: true });
          if (files.length === 0) return { content: "No scratch space exists yet." };

          return { content: files.sort().join("\n") };
        },
      });
    });

    return () => controller.abort();
  },
});
