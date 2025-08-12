#!/usr/bin/env node

/**
 * Claude Code File Protection Hook
 *
 * This PreToolUse hook prevents Claude from reading sensitive files like
 * .env files, SSH keys, API tokens, and other credential files.
 *
 * To add new protection patterns, edit src/config/protected-patterns.json
 */

import { readInput, parseHookEvent } from "./shared/input.js";
import { logMessage } from "./shared/logger.js";
import { PreToolUseEvent } from "./shared/types.js";
import { readFileSync } from "fs";
import { join, dirname, basename, extname, normalize } from "path";
import { fileURLToPath } from "url";

// ===== TYPES =====

interface ProtectionPatterns {
  description: string;
  fileExtensions: string[];
  filePaths: string[];
  filenamePatterns: string[];
  directoryPatterns: string[];
  customPatterns: string[];
}

interface ProtectionResult {
  isProtected: boolean;
  reason: string | null;
}

interface PermissionResponse {
  hookSpecificOutput: {
    hookEventName: "PreToolUse";
    permissionDecision: "allow" | "deny";
    permissionDecisionReason?: string;
  };
}

// ===== CONFIGURATION LOADING =====

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PATTERNS_FILE = join(__dirname, "config", "protected-patterns.json");

let PROTECTED_PATTERNS: ProtectionPatterns;

try {
  const patternsContent = readFileSync(PATTERNS_FILE, "utf8");
  PROTECTED_PATTERNS = JSON.parse(patternsContent) as ProtectionPatterns;
  logMessage("INFO", "File protection patterns loaded successfully");
} catch (error) {
  logMessage("ERROR", `Failed to load protection patterns: ${error}`);
  process.exit(1);
}

// ===== UTILITY FUNCTIONS =====

/**
 * Normalize file path for consistent comparison
 */
function normalizePath(filePath: string): string {
  if (!filePath) return "";

  // Handle ~ home directory expansion
  if (filePath.startsWith("~/")) {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    filePath = filePath.replace("~", homeDir);
  }

  return normalize(filePath).toLowerCase();
}

/**
 * Check if filename matches any wildcard pattern
 */
function matchesWildcardPattern(filename: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");

  const regex = new RegExp(`^${regexPattern}$`, "i");
  return regex.test(filename);
}

/**
 * Check if file matches extension patterns
 */
function matchesFileExtension(filePath: string): boolean {
  const normalizedPath = normalizePath(filePath);

  return PROTECTED_PATTERNS.fileExtensions.some((ext) => {
    return normalizedPath.endsWith(ext.toLowerCase());
  });
}

/**
 * Check if file matches path patterns
 */
function matchesFilePath(filePath: string): boolean {
  const normalizedPath = normalizePath(filePath);

  return PROTECTED_PATTERNS.filePaths.some((pathPattern) => {
    const normalizedPattern = pathPattern.toLowerCase();
    return normalizedPath.includes(normalizedPattern);
  });
}

/**
 * Check if filename matches pattern
 */
function matchesFilenamePattern(filePath: string): boolean {
  const filename = basename(filePath).toLowerCase();

  return PROTECTED_PATTERNS.filenamePatterns.some((pattern) => {
    return matchesWildcardPattern(filename, pattern);
  });
}

/**
 * Check if file is in protected directory
 */
function matchesDirectoryPattern(filePath: string): boolean {
  const normalizedPath = normalizePath(filePath);

  return PROTECTED_PATTERNS.directoryPatterns.some((dirPattern) => {
    const normalizedPattern = dirPattern.toLowerCase();
    return normalizedPath.includes(normalizedPattern);
  });
}

/**
 * Check if file matches custom patterns
 */
function matchesCustomPattern(filePath: string): boolean {
  const normalizedPath = normalizePath(filePath);
  const filename = basename(filePath).toLowerCase();

  return PROTECTED_PATTERNS.customPatterns.some((pattern) => {
    // Handle both full path and filename patterns
    return (
      matchesWildcardPattern(normalizedPath, pattern.toLowerCase()) ||
      matchesWildcardPattern(filename, pattern.toLowerCase())
    );
  });
}

// ===== MAIN PROTECTION LOGIC =====

/**
 * Check if a file should be protected from access
 */
function isProtectedFile(filePath: string): ProtectionResult {
  if (!filePath) {
    return { isProtected: false, reason: null };
  }

  // Check each protection category
  if (matchesFileExtension(filePath)) {
    return {
      isProtected: true,
      reason: `File extension matches protected pattern (${extname(filePath)})`,
    };
  }

  if (matchesFilePath(filePath)) {
    return {
      isProtected: true,
      reason: "File path matches protected pattern",
    };
  }

  if (matchesFilenamePattern(filePath)) {
    return {
      isProtected: true,
      reason: "Filename contains sensitive pattern",
    };
  }

  if (matchesDirectoryPattern(filePath)) {
    return {
      isProtected: true,
      reason: "File is in protected directory",
    };
  }

  if (matchesCustomPattern(filePath)) {
    return {
      isProtected: true,
      reason: "File matches custom protection pattern",
    };
  }

  return { isProtected: false, reason: null };
}

/**
 * Handle PreToolUse events for file protection
 */
function handlePreToolUse(event: PreToolUseEvent): PermissionResponse {
  const toolName = event.tool_name;
  const toolInput = event.tool_input;

  logMessage("INFO", `Checking tool: ${toolName}`);

  // Extract file path based on tool type
  let filePath: string | null = null;

  if (toolName === "Read") {
    filePath = toolInput?.file_path;
  } else if (toolName === "Glob") {
    // For Glob, check if pattern might target sensitive files
    const pattern = toolInput?.pattern || "";
    if (
      pattern.includes(".env") ||
      pattern.includes("secret") ||
      pattern.includes("password") ||
      pattern.includes("key")
    ) {
      logMessage(
        "WARNING",
        `Blocked Glob pattern targeting sensitive files: ${pattern}`,
      );
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "Glob pattern may target sensitive files",
        },
      };
    }
  } else if (toolName === "Grep") {
    // Allow Grep but warn if searching in protected directories
    const searchPath = toolInput?.path || "";
    if (searchPath) {
      const protection = isProtectedFile(searchPath);
      if (protection.isProtected) {
        logMessage(
          "WARNING",
          `Blocked Grep in protected location: ${searchPath} - ${protection.reason}`,
        );
        return {
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: `Cannot search in protected location: ${protection.reason}`,
          },
        };
      }
    }
  }

  // Check if file should be protected
  if (filePath) {
    const protection = isProtectedFile(filePath);

    if (protection.isProtected) {
      const message = `Access denied to ${filePath}: ${protection.reason}`;
      logMessage("WARNING", message);

      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: message,
        },
      };
    }
  }

  // Allow the operation
  logMessage("INFO", `Allowing ${toolName} operation`);
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
    },
  };
}

// ===== HOOK ENTRY POINT =====

async function main(): Promise<void> {
  try {
    const input = await readInput();
    const event = parseHookEvent(input);

    if (!event) {
      logMessage("ERROR", "No valid hook event received");
      process.exit(0);
    }

    if (event.hook_event_name === "PreToolUse") {
      const response = handlePreToolUse(event as PreToolUseEvent);

      // Output the permission decision
      console.log(JSON.stringify(response));

      // Exit with appropriate code
      if (response.hookSpecificOutput.permissionDecision === "deny") {
        process.exit(2); // Deny permission
      } else {
        process.exit(0); // Allow permission
      }
    } else {
      logMessage("WARNING", `Unexpected event type: ${event.hook_event_name}`);
      process.exit(0);
    }
  } catch (error) {
    logMessage("ERROR", `File protection hook error: ${error}`);
    process.exit(1);
  }
}

// Run the hook
main();

