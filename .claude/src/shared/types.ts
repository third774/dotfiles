export interface HookEventBase {
  hook_event_name: string;
}

export interface NotificationEvent extends HookEventBase {
  hook_event_name: 'Notification';
  message: string;
}

export interface StopEvent extends HookEventBase {
  hook_event_name: 'Stop';
}

export interface SubagentStopEvent extends HookEventBase {
  hook_event_name: 'SubagentStop';
  agentType?: string;
}

export type HookEvent = NotificationEvent | StopEvent | SubagentStopEvent;