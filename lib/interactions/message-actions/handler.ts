import type { MessageActionPayload, SlackInteractionPayload } from '../types'
import { handleSaveAsPrompt } from './save-as-prompt'

/**
 * Type guard for message actions
 */
export function isMessageAction(payload: SlackInteractionPayload): payload is MessageActionPayload {
  return payload.type === 'message_action'
}

/**
 * Handle message actions triggered from message context menus
 * Routes to the appropriate handler based on the callback_id
 */
export const handleMessageAction = (payload: MessageActionPayload): object | undefined => {
  const { callback_id, trigger_id, message } = payload
  console.log(`Processing message action: ${callback_id}`)

  // Check if trigger_id is available
  if (!trigger_id) {
    console.error('No trigger_id available for message action')
    return undefined
  }

  // Route to the appropriate handler based on callback_id
  switch (callback_id) {
    case 'save_as_prompt':
      return handleSaveAsPrompt(trigger_id, message.text || '')
    default:
      console.log(`Unhandled message action: ${callback_id}`)
  }

  return undefined
}
