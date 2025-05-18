/**
 * Type definitions for Slack interactions
 */

import type { KnownBlock, View } from '@slack/web-api'

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
 * Type for Slack view state values (form inputs)
 */
export interface SlackViewStateValue {
  type: string
  value: string
}

/**
 * Type for Slack select menu state values
 */
export interface SlackSelectStateValue {
  type: string
  selected_option?: {
    text: {
      type: string
      text: string
      emoji?: boolean
    }
    value: string
  }
}

/**
 * Represents a Slack action from block_actions payload
 */
export interface SlackAction {
  action_id: string
  block_id: string
  value?: string
  type: string
  text?: {
    type: string
    text: string
    emoji?: boolean
  }
  selected_option?: {
    text: {
      type: string
      text: string
      emoji?: boolean
    }
    value: string
  }
}

/**
 * Represents a Slack block action interaction
 */
export interface SlackBlockAction {
  type: 'block_actions'
  user: {
    id: string
    username: string
    team_id: string
  }
  trigger_id: string
  container: {
    type: string // 'view', 'message', etc.
    view_id?: string // Present when container.type is 'view'
  }
  view?: {
    id: string
    state: {
      values: Record<string, Record<string, SlackViewStateValue | SlackSelectStateValue>>
    }
  }
  actions: SlackAction[]
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
      values: Record<string, Record<string, SlackViewStateValue | SlackSelectStateValue>>
    }
  }
}
