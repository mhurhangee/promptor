/**
 * Type definitions for Slack interactions
 */

import type { View } from '@slack/web-api'

/**
 * Represents a Slack shortcut interaction
 */
export interface SlackShortcut {
  type: 'shortcut' | 'message_action'
  callback_id: string
  trigger_id: string
  user: {
    id: string
    username: string
    team_id: string
  }
  team: {
    id: string
    domain: string
  }
}

/**
 * Represents a Slack view submission interaction
 */
export interface SlackViewSubmission {
  type: 'view_submission'
  user: {
    id: string
    username: string
    team_id: string
  }
  view: View & {
    id: string
    callback_id: string
    state: {
      values: Record<string, Record<string, { value: string }>>
    }
  }
}
