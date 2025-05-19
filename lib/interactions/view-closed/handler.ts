import type { SlackInteractionPayload, ViewClosedPayload } from '../types'

/**
 * Type guard for view closed events
 */
export function isViewClosed(payload: SlackInteractionPayload): payload is ViewClosedPayload {
  return payload.type === 'view_closed'
}

/**
 * Handle view closed events (modal closed without submission)
 * This is triggered when a user clicks the X or Cancel button on a modal
 */
export const handleViewClosed = (payload: ViewClosedPayload): object | undefined => {
  const { view, user, is_cleared } = payload
  const { callback_id } = view

  console.log(`Processing view closed: ${callback_id} by user ${user.id}, cleared: ${is_cleared}`)

  // Handle different view closed events based on callback_id
  switch (callback_id) {
    case 'create_prompt_modal':
      return handleCreatePromptClosed(user.id)
    case 'prompt_library_modal':
      return handlePromptLibraryClosed(user.id)
    default:
      console.log(`Unhandled view closed: ${callback_id}`)
  }

  // Return undefined as we don't need to send a response to Slack
  return undefined
}

/**
 * Handle the create prompt modal being closed without submission
 * This could be used to log analytics or clean up any temporary data
 */
const handleCreatePromptClosed = (userId: string): undefined => {
  console.log(`User ${userId} closed the create prompt modal without saving`)

  // In a real implementation, you might want to log this event or clean up any temporary data
  // For this example, we'll just log a message

  return undefined
}

/**
 * Handle the prompt library modal being closed
 * This could be used to log analytics or clean up any temporary data
 */
const handlePromptLibraryClosed = (userId: string): undefined => {
  console.log(`User ${userId} closed the prompt library modal`)

  // In a real implementation, you might want to log this event or clean up any temporary data
  // For this example, we'll just log a message

  return undefined
}
