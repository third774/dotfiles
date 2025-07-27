import { existsSync, mkdirSync, appendFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const LOG_DIR = join(homedir(), 'Library', 'Logs', 'ClaudeCode');
const LOG_FILE = join(LOG_DIR, 'notify-hook.log');
const DEBUG = process.env.DEBUG === '1';

function ensureLogDirectory(): void {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true, mode: 0o700 });
  }
}

function sanitizeMessage(message: string): string {
  return message
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 1000); // Truncate to reasonable length
}

export function logMessage(level: string, message: string): void {
  ensureLogDirectory();
  const sanitized = sanitizeMessage(message);
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${sanitized}\n`;
  
  try {
    appendFileSync(LOG_FILE, logEntry, { mode: 0o600 });
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

export function debugLog(message: string): void {
  if (DEBUG) {
    logMessage('DEBUG', message);
  }
}