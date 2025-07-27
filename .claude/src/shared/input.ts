import { logMessage, debugLog } from './logger.js';
import { HookEvent } from './types.js';

export async function readInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    let input = '';
    
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    
    process.stdin.on('end', () => {
      resolve(input);
    });
    
    process.stdin.on('error', (error) => {
      reject(error);
    });
  });
}

export function parseHookEvent(input: string): HookEvent | null {
  debugLog(`Raw input (first 200 chars): ${input.substring(0, 200)}...`);
  
  if (!input.trim()) {
    logMessage('ERROR', 'Empty input received');
    return null;
  }
  
  try {
    const parsed = JSON.parse(input) as HookEvent;
    
    if (!parsed.hook_event_name) {
      logMessage('ERROR', 'Missing hook_event_name');
      return null;
    }
    
    // Sanitize hook_event_name
    const sanitized = parsed.hook_event_name.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50);
    parsed.hook_event_name = sanitized as any;
    
    logMessage('INFO', `Hook event: ${sanitized}`);
    return parsed;
    
  } catch (error) {
    logMessage('ERROR', 'Invalid JSON or missing hook_event_name');
    debugLog(`Raw input that failed JSON parsing: ${input}`);
    return null;
  }
}