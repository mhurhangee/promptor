import type { SlackInteractionPayload, ViewClosedPayload } from '../types'
import { handleCreatePromptClosed } from './create-prompt-closed'

/**
 * Type guard for view closed events
 */
export function isViewClosed(payload: SlackInteractionPayload): payload is ViewClosedPayload {
  return payload.type === 'view_closed'
}

/**
 * Handle view closed events (modal closed without submission)
 * This is triggered when a user clicks the X or Cancel button on a modal
 * Routes to the appropriate handler based on the callback_id
 */
export const handleViewClosed = (payload: ViewClosedPayload): object | undefined => {
  const { view, user, is_cleared } = payload
  const { callback_id } = view

  console.log(`Processing view closed: ${callback_id} by user ${user.id}, cleared: ${is_cleared}`)

  // Route to the appropriate handler based on callback_id
  switch (callback_id) {
    case 'create_prompt_modal':
      return handleCreatePromptClosed(user.id)
    case 'edit_prompt_modal':
      // No specific handling needed for edit modal closing
      console.log(`User ${user.id} closed the edit prompt modal`)
      return undefined
    default:
      console.log(`Unhandled view closed: ${callback_id}`)
  }

  // Return undefined as we don't need to send a response to Slack
  return undefined
}
