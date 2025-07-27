export interface HookEventBase {
  hook_event_name: string;
  session_id: string;
  transcript_path: string;
  cwd: string;
}

export interface NotificationEvent extends HookEventBase {
  hook_event_name: "Notification";
  message: string;
}

export interface StopEvent extends HookEventBase {
  hook_event_name: "Stop";
  stop_hook_active: boolean;
}

export interface SubagentStopEvent extends HookEventBase {
  hook_event_name: "SubagentStop";
  agentType?: string;
}

export interface PreToolUseEvent extends HookEventBase {
  hook_event_name: "PreToolUse";
  tool_name: string;
  tool_input: any;
}

export interface PostToolUseEvent extends HookEventBase {
  hook_event_name: "PostToolUse";
  tool_name: string;
  tool_input: any;
  tool_response: any;
}

export interface UserPromptSubmitEvent extends HookEventBase {
  hook_event_name: "UserPromptSubmit";
  prompt: string;
}

export interface PreCompactEvent extends HookEventBase {
  hook_event_name: "PreCompact";
  trigger: string;
  custom_instructions: string;
}

export type HookEvent = NotificationEvent | StopEvent | SubagentStopEvent | PreToolUseEvent | PostToolUseEvent | UserPromptSubmitEvent | PreCompactEvent;
