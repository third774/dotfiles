/**
 * OpenCode File Protection Plugin
 * 
 * This plugin prevents OpenCode from accessing sensitive files like .env files,
 * SSH keys, cloud credentials, and database credentials.
 * 
 * When a protected file is accessed, OpenCode receives a clear error message
 * instructing the user to manually inspect the file and provide necessary context.
 */

import { Plugin } from "@opencode/plugin";
import { readFileSync } from "fs";
import { join, dirname, basename, extname, normalize, sep } from "path";
import { fileURLToPath } from "url";

// ===== TYPES =====

interface ProtectionCategory {
  description: string;
  enabled: boolean;
  extensions?: string[];
  filenames?: string[];
  patterns?: string[];
  paths?: string[];
  directories?: string[];
  exceptions?: string[];
}

interface ProtectionPatterns {
  description: string;
  patterns: Record<string, ProtectionCategory>;
  message_template: string;
}

type ProtectionResult =
  | { isProtected: true; reason: string; category: string }
  | { isProtected: false; reason: null; category: null };

// ===== CONFIGURATION LOADING =====

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PATTERNS_FILE = join(__dirname, "protection-patterns.json");

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const property = (value: object, key: string): unknown =>
  Object.getOwnPropertyDescriptor(value, key)?.value;

const isProtectionCategory = (value: unknown): value is ProtectionCategory => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return (
    typeof property(value, "description") === "string" &&
    typeof property(value, "enabled") === "boolean" &&
    (property(value, "extensions") === undefined || isStringArray(property(value, "extensions"))) &&
    (property(value, "filenames") === undefined || isStringArray(property(value, "filenames"))) &&
    (property(value, "patterns") === undefined || isStringArray(property(value, "patterns"))) &&
    (property(value, "paths") === undefined || isStringArray(property(value, "paths"))) &&
    (property(value, "directories") === undefined || isStringArray(property(value, "directories"))) &&
    (property(value, "exceptions") === undefined || isStringArray(property(value, "exceptions")))
  );
};

const isProtectionPatterns = (value: unknown): value is ProtectionPatterns => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const patterns = property(value, "patterns");
  if (
    typeof property(value, "description") !== "string" ||
    typeof property(value, "message_template") !== "string" ||
    !patterns ||
    typeof patterns !== "object" ||
    Array.isArray(patterns)
  ) {
    return false;
  }

  return Object.values(patterns).every(isProtectionCategory);
};

let CONFIG: ProtectionPatterns;

try {
  const patternsContent = readFileSync(PATTERNS_FILE, "utf8");
  const parsed: unknown = JSON.parse(patternsContent);
  if (!isProtectionPatterns(parsed)) {
    throw new Error("Protection patterns have an invalid format");
  }
  CONFIG = parsed;
} catch (error) {
  throw new Error(`Failed to load protection patterns: ${error}`);
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

  return normalize(filePath);
}

/**
 * Convert glob pattern to regex
 */
function globToRegex(pattern: string): RegExp {
  // Escape special regex characters except * and ?
  let regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");

  return new RegExp(`^${regexPattern}$`, "i");
}

/**
 * Check if a path matches a glob pattern
 */
function matchesPattern(path: string, pattern: string): boolean {
  const normalizedPath = normalizePath(path).toLowerCase();
  const regex = globToRegex(pattern.toLowerCase());
  return regex.test(normalizedPath);
}

/**
 * Check if path is in a protected directory
 */
function isInDirectory(filePath: string, directories: string[]): boolean {
  const normalizedPath = normalizePath(filePath).toLowerCase();
  const pathParts = normalizedPath.split(sep);

  return directories.some((dir) => {
    const normalizedDir = dir.toLowerCase().replace(/\//g, sep);
    return pathParts.includes(normalizedDir) || normalizedPath.includes(normalizedDir);
  });
}

/**
 * Check if a file is explicitly excepted from protection
 */
function isException(filePath: string, exceptions: string[] | undefined): boolean {
  if (!exceptions || exceptions.length === 0) return false;

  const filename = basename(filePath).toLowerCase();
  const normalizedPath = normalizePath(filePath).toLowerCase();

  return exceptions.some((exception) => {
    const normalizedException = exception.toLowerCase();
    return (
      filename === normalizedException ||
      normalizedPath.endsWith(normalizedException) ||
      matchesPattern(normalizedPath, normalizedException)
    );
  });
}

/**
 * Check if file matches a protection category
 */
function matchesCategory(
  filePath: string,
  category: ProtectionCategory
): boolean {
  if (!category.enabled) return false;

  const filename = basename(filePath);
  const ext = extname(filePath);
  const normalizedPath = normalizePath(filePath);

  // Check exceptions first
  if (isException(filePath, category.exceptions)) {
    return false;
  }

  // Check file extensions
  if (category.extensions) {
    const matchesExt = category.extensions.some((extension) => {
      // Handle extensions that may or may not start with a dot
      const normalizedExt = extension.startsWith(".")
        ? extension
        : `.${extension}`;
      return ext.toLowerCase() === normalizedExt.toLowerCase() ||
             filename.toLowerCase().endsWith(normalizedExt.toLowerCase());
    });
    if (matchesExt) return true;
  }

  // Check exact filenames
  if (category.filenames) {
    const matchesFilename = category.filenames.some(
      (name) => filename.toLowerCase() === name.toLowerCase()
    );
    if (matchesFilename) return true;
  }

  // Check exact paths
  if (category.paths) {
    const matchesPath = category.paths.some((path) =>
      normalizedPath.toLowerCase().includes(path.toLowerCase())
    );
    if (matchesPath) return true;
  }

  // Check directory patterns
  if (category.directories) {
    if (isInDirectory(filePath, category.directories)) return true;
  }

  // Check glob patterns
  if (category.patterns) {
    const matchesGlob = category.patterns.some((pattern) =>
      matchesPattern(filePath, pattern)
    );
    if (matchesGlob) return true;
  }

  return false;
}

/**
 * Check if a file should be protected
 */
function isProtectedFile(filePath: string): ProtectionResult {
  if (!filePath) {
    return { isProtected: false, reason: null, category: null };
  }

  // Check each protection category
  for (const [categoryName, category] of Object.entries(CONFIG.patterns)) {
    if (matchesCategory(filePath, category)) {
      return {
        isProtected: true,
        reason: category.description,
        category: categoryName,
      };
    }
  }

  return { isProtected: false, reason: null, category: null };
}

/**
 * Generate user-friendly error message
 */
function generateErrorMessage(filePath: string, reason: string): string {
  return CONFIG.message_template
    .replace("{filepath}", filePath)
    .replace("{reason}", reason);
}

/**
 * Check if a glob pattern might target sensitive files
 */
function globTargetsSensitiveFiles(pattern: string): boolean {
  const sensitiveKeywords = [
    ".env",
    "secret",
    "password",
    "token",
    "credential",
    "api-key",
    "apikey",
    ".ssh",
    ".aws",
    ".pem",
    ".key",
  ];

  const lowerPattern = pattern.toLowerCase();
  return sensitiveKeywords.some((keyword) => lowerPattern.includes(keyword));
}

// ===== PLUGIN IMPLEMENTATION =====

const record = (value: unknown): object | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value;
};

const stringProperty = (value: unknown, ...keys: string[]): string | undefined => {
  const properties = record(value);
  if (!properties) return undefined;

  for (const key of keys) {
    const valueAtKey = property(properties, key);
    if (typeof valueAtKey === "string") return valueAtKey;
  }
};

export default Plugin.define({
  id: "file-protection",
  async setup(ctx) {
    const log = (message: string) => console.info(`[file-protection] ${message}`);

    log(`Initialized for directory: ${ctx.location.directory}`);

    await ctx.tool.hook("execute.before", (event) => {
      const toolName = event.tool;

      // Intercept file reading tools
      if (toolName === "read") {
        const filePath = stringProperty(event.input, "filePath", "file_path");
        if (filePath) {
          const protection = isProtectedFile(filePath);
          if (protection.isProtected) {
            const errorMsg = generateErrorMessage(filePath, protection.reason);
            log(`Blocked read: ${filePath} (${protection.category})`);
            throw new Error(errorMsg);
          }
        }
      }

      // Intercept glob patterns that might target sensitive files
      if (toolName === "glob") {
        const pattern = stringProperty(event.input, "pattern");
        if (pattern && globTargetsSensitiveFiles(pattern)) {
          const errorMsg = `🔒 Access Denied: Glob pattern blocked\n\nThe pattern '${pattern}' appears to target sensitive files.\n\nIf you need to search for files, please:\n1. Use a more specific pattern that excludes sensitive files\n2. Or manually list the files you need and I can help with those specifically`;
          log(`Blocked glob: ${pattern}`);
          throw new Error(errorMsg);
        }
      }

      // Intercept grep searches in protected paths
      if (toolName === "grep") {
        const searchPath = stringProperty(event.input, "path");
        if (searchPath) {
          const protection = isProtectedFile(searchPath);
          if (protection.isProtected) {
            const errorMsg = generateErrorMessage(searchPath, protection.reason);
            log(`Blocked grep: ${searchPath} (${protection.category})`);
            throw new Error(errorMsg);
          }
        }
      }

      // Intercept list operations on protected directories
      if (toolName === "list") {
        const listPath = stringProperty(event.input, "path");
        if (listPath) {
          const protection = isProtectedFile(listPath);
          if (protection.isProtected) {
            const errorMsg = generateErrorMessage(listPath, protection.reason);
            log(`Blocked list: ${listPath} (${protection.category})`);
            throw new Error(errorMsg);
          }
        }
      }
    });

    const controller = new AbortController();
    void (async () => {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
        if (event.type === "session.created") {
          log("Session started - file protection active");
        }
      }
    })().catch((error) => {
      if (!controller.signal.aborted) {
        console.error("[file-protection] event subscription failed:", error);
      }
    });

    return () => controller.abort();
  },
});
