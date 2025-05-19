/**
 * Type definitions for Slack interaction payloads
 *
 * These types represent the various interaction payloads that Slack sends
 * to our API endpoint when users interact with our app.
 */

// Common properties for all interaction payloads
export interface BaseInteractionPayload {
  type: string
  token: string
  team: { id: string; domain?: string }
  user: { id: string; name?: string; username?: string }
  api_app_id: string
  trigger_id?: string
  response_url?: string
}

// Global shortcut payload
export interface GlobalShortcutPayload extends BaseInteractionPayload {
  type: 'shortcut'
  callback_id: string
}

// Message action payload
export interface MessageActionPayload extends BaseInteractionPayload {
  type: 'message_action'
  callback_id: string
  message: {
    ts: string
    text?: string
    [key: string]: unknown
  }
  channel: { id: string; name?: string }
}

// Block action
export interface Action {
  action_id: string
  block_id: string
  type: string
  value?: string
  selected_option?: { value: string }
  selected_options?: Array<{ value: string }>
  selected_user?: string
  selected_users?: string[]
  selected_channel?: string
  selected_channels?: string[]
  selected_date?: string
  selected_time?: string
  [key: string]: unknown
}

// Block actions payload
export interface BlockActionsPayload extends BaseInteractionPayload {
  type: 'block_actions'
  actions: Action[]
  container: {
    type: string
    message_ts?: string
    channel_id?: string
    view_id?: string
    [key: string]: unknown
  }
  channel?: { id: string; name?: string }
  message?: { ts: string; text?: string; [key: string]: unknown }
}

// View state
export interface ViewState {
  values: {
    [blockId: string]: {
      [actionId: string]: {
        type: string
        value?: string
        selected_option?: { value: string }
        selected_options?: Array<{ value: string }>
        selected_user?: string
        selected_users?: string[]
        selected_channel?: string
        selected_channels?: string[]
        selected_date?: string
        selected_time?: string
        [key: string]: unknown
      }
    }
  }
}

// View payload
export interface View {
  id: string
  callback_id: string
  type: string
  state?: ViewState
  private_metadata?: string
  [key: string]: unknown
}

// View submission payload
export interface ViewSubmissionPayload extends BaseInteractionPayload {
  type: 'view_submission'
  view: View
}

// View closed payload
export interface ViewClosedPayload extends BaseInteractionPayload {
  type: 'view_closed'
  view: View
  is_cleared: boolean
}

/**
 * Union type for all Slack interaction payloads
 * This allows us to type-check the payload in the interaction handler
 */
export type SlackInteractionPayload =
  | GlobalShortcutPayload
  | MessageActionPayload
  | BlockActionsPayload
  | ViewSubmissionPayload
  | ViewClosedPayload
