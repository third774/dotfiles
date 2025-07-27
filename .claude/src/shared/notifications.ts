import { execSync } from 'child_process';
import { debugLog } from './logger.js';

function escapeAppleScript(input: string): string {
  // Remove control characters except tab and newline
  let escaped = input.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '');
  
  // Handle backslashes and quotes
  escaped = escaped.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  
  // Truncate to reasonable length
  if (escaped.length > 200) {
    escaped = escaped.substring(0, 197) + '...';
  }
  
  return escaped;
}

function sanitizeForSpeech(text: string): string {
  // Remove control characters and make speech-friendly
  return text
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[^\w\s.,!?-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100); // Keep voice messages shorter
}

export function sendNotification(message: string, title: string, sound: string = 'Tink'): void {
  const escapedMessage = escapeAppleScript(message);
  const escapedTitle = escapeAppleScript(title);
  
  debugLog(`Sending notification: title='${title}', message='${message}', sound='${sound}'`);
  
  const script = `display notification "${escapedMessage}" with title "${escapedTitle}" sound name "${sound}"`;
  
  try {
    execSync(`osascript -e '${script}'`, { stdio: 'ignore' });
  } catch (error) {
    debugLog('Failed to send notification');
  }
}

export function announceVoice(message: string): void {
  const speechText = sanitizeForSpeech(message);
  
  if (!speechText) return;
  
  debugLog(`Announcing: ${speechText}`);
  
  try {
    execSync(`say '${speechText}'`, { stdio: 'ignore' });
  } catch (error) {
    debugLog('Failed to announce voice message');
  }
}