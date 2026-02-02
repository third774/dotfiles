import { tool } from "@opencode-ai/plugin";
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, } from "fs";
import { join } from "path";
import { z } from "zod";
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
function getScratchPath(directory, sessionId) {
    return join(directory, ".opencode", "__sessions", sessionId);
}
function validateFilename(filename) {
    return !filename.includes("..") && !filename.startsWith("/");
}
const scratchpadPlugin = async (input) => {
    const hooks = {
        event: async (eventInput) => {
            const event = eventInput.event;
            if (event.type === "session.created") {
                const sessionId = event.properties.info.id;
                const directory = input.directory;
                const scratchPath = getScratchPath(directory, sessionId);
                mkdirSync(scratchPath, { recursive: true });
                const indexPath = join(scratchPath, "index.md");
                writeFileSync(indexPath, INITIAL_TEMPLATE);
            }
        },
        "experimental.session.compacting": async (compactInput, output) => {
            const scratchPath = getScratchPath(input.directory, compactInput.sessionID);
            const indexPath = join(scratchPath, "index.md");
            if (existsSync(indexPath)) {
                const indexContent = readFileSync(indexPath, "utf-8");
                output.context.push(`## Session Scratch Space

${indexContent}

Path: .opencode/__sessions/${compactInput.sessionID}/
Use session_scratch_read to load specific files.`);
            }
        },
        tool: {
            session_scratch_write: tool({
                description: "Write content to a file in the session scratch space",
                args: {
                    filename: z.string().describe("Filename to write (relative path)"),
                    content: z.string().describe("File content"),
                },
                execute: async (args, context) => {
                    const filename = args.filename;
                    const content = args.content;
                    if (!validateFilename(filename)) {
                        return "Error: Invalid filename. Path traversal not allowed.";
                    }
                    const scratchPath = getScratchPath(context.directory, context.sessionID);
                    const filePath = join(scratchPath, filename);
                    if (!filePath.startsWith(scratchPath)) {
                        return "Error: Invalid filename. Path traversal not allowed.";
                    }
                    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
                    mkdirSync(dir, { recursive: true });
                    writeFileSync(filePath, content);
                    return `Wrote to ${filename}`;
                },
            }),
            session_scratch_read: tool({
                description: "Read content from a file in the session scratch space",
                args: {
                    filename: z.string().describe("Filename to read (relative path)"),
                },
                execute: async (args, context) => {
                    const filename = args.filename;
                    if (!validateFilename(filename)) {
                        return "Error: Invalid filename. Path traversal not allowed.";
                    }
                    const scratchPath = getScratchPath(context.directory, context.sessionID);
                    const filePath = join(scratchPath, filename);
                    if (!filePath.startsWith(scratchPath)) {
                        return "Error: Invalid filename. Path traversal not allowed.";
                    }
                    if (!existsSync(filePath)) {
                        return "File not found";
                    }
                    return readFileSync(filePath, "utf-8");
                },
            }),
            session_scratch_list: tool({
                description: "List all files in the session scratch space",
                args: {},
                execute: async (_args, context) => {
                    const scratchPath = getScratchPath(context.directory, context.sessionID);
                    if (!existsSync(scratchPath)) {
                        return "No scratch space exists yet";
                    }
                    const files = readdirSync(scratchPath, { recursive: true });
                    if (files.length === 0) {
                        return "No scratch space exists yet";
                    }
                    return files.join("\n");
                },
            }),
        },
    };
    return hooks;
};
export { scratchpadPlugin as ScratchpadPlugin };
//# sourceMappingURL=index.js.map