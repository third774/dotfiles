#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Route Path to DeepLink
// @raycast.mode silent

// Optional parameters:
// @raycast.icon 🤖

// Documentation:
// @raycast.author Kevin Kipp
// @raycast.authorURL https://bsky.app/profile/kevinkipp.com

const { execFileSync } = require("node:child_process");

const DASHBOARD_ORIGIN = "https://dash.cloudflare.com";

function readClipboard() {
  return execFileSync("pbpaste", { encoding: "utf8" });
}

function writeClipboard(text) {
  execFileSync("pbcopy", { input: text });
}

function replacePlaceholders(value) {
  return value.replaceAll(":accountId", ":account").replaceAll(":zoneName", ":zone");
}

function isLikelyUrl(token) {
  try {
    const url = new URL(token);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isRouteLikeToken(token) {
  return token.includes("/") || token.startsWith(":");
}

function toDeeplink(pathToken) {
  const normalizedPath = pathToken.startsWith("/") ? pathToken : `/${pathToken}`;
  return `${DASHBOARD_ORIGIN}/?to=${normalizedPath}`;
}

function transformToken(token) {
  if (isLikelyUrl(token)) {
    return replacePlaceholders(token);
  }

  if (isRouteLikeToken(token)) {
    return toDeeplink(replacePlaceholders(token));
  }

  return token;
}

function transformClipboardText(text) {
  const parts = text.split(/(\s+)/);
  return parts
    .map((part) => {
      if (/^\s+$/.test(part) || part.length === 0) {
        return part;
      }

      return transformToken(part);
    })
    .join("");
}

function main() {
  try {
    const clipboardText = readClipboard();

    if (clipboardText.trim().length === 0) {
      throw new Error("Clipboard is empty");
    }

    const transformed = transformClipboardText(clipboardText);
    writeClipboard(transformed);
    console.log(transformed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`route-path-to-deeplink failed: ${message}`);
    process.exit(1);
  }
}

main();
