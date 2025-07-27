#!/usr/bin/env node

import { readInput, parseHookEvent } from './shared/input.js';
import { sendNotification, announceVoice } from './shared/notifications.js';
import { logMessage } from './shared/logger.js';
import { SubagentStopEvent } from './shared/types.js';

function sanitizeAgentType(agentType: string): string {
  return agentType
    .replace(/[^a-zA-Z0-9 ._-]/g, '')
    .substring(0, 50);
}

async function handleSubagentStop(event: SubagentStopEvent): Promise<void> {
  if (event.agentType) {
    const sanitizedAgentType = sanitizeAgentType(event.agentType);
    const notificationText = `Subagent completed: ${sanitizedAgentType}`;
    const voiceText = `${sanitizedAgentType} subagent completed`;
    
    sendNotification(notificationText, 'Claude Code Subagent', 'Tink');
    announceVoice(voiceText);
  } else {
    const notificationText = 'Subagent completed';
    const voiceText = 'Subagent completed';
    
    sendNotification(notificationText, 'Claude Code Subagent', 'Tink');
    announceVoice(voiceText);
  }
}

async function main(): Promise<void> {
  try {
    const input = await readInput();
    const event = parseHookEvent(input);
    
    if (!event) {
      process.exit(0);
    }
    
    if (event.hook_event_name === 'SubagentStop') {
      await handleSubagentStop(event as SubagentStopEvent);
    } else {
      logMessage('WARNING', `Unexpected event type: ${event.hook_event_name}`);
    }
    
  } catch (error) {
    logMessage('ERROR', `Failed to process subagent stop event: ${error}`);
  }
  
  process.exit(0);
}

main();