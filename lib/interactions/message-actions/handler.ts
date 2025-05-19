import { createPromptModal } from '../../config/views'
import { showModal } from '../../slack'
import type { MessageActionPayload, SlackInteractionPayload } from '../types'

/**
 * Type guard for message actions
 */
export function isMessageAction(payload: SlackInteractionPayload): payload is MessageActionPayload {
  return payload.type === 'message_action'
}

/**
 * Handle message actions triggered from message context menus
 */
export const handleMessageAction = (payload: MessageActionPayload): object | undefined => {
  const { callback_id, trigger_id, message } = payload
  console.log(`Processing message action: ${callback_id}`)

  // Check if trigger_id is available
  if (!trigger_id) {
    console.error('No trigger_id available for message action')
    return undefined
  }

  // Handle different message actions based on callback_id
  switch (callback_id) {
    case 'save_as_prompt':
      return handleSaveAsPrompt(trigger_id, message.text || '')
    default:
      console.log(`Unhandled message action: ${callback_id}`)
  }

  return undefined
}

/**
 * Handle the save as prompt message action
 * Opens a modal pre-filled with the message text
 */
const handleSaveAsPrompt = (triggerId: string, messageText: string): undefined => {
  console.log(
    `Saving message as prompt: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`
  )

  // Create a modified version of the create prompt modal with pre-filled text
  const prefilledModal = {
    ...createPromptModal,
    blocks: createPromptModal.blocks.map((block) => {
      // Pre-fill the prompt text field with the message text
      if ('block_id' in block && block.block_id === 'prompt_text_block' && 'element' in block) {
        return {
          ...block,
          element: {
            ...block.element,
            initial_value: messageText,
          },
        }
      }
      return block
    }),
  }

  // Open the modal with pre-filled text
  showModal(triggerId, prefilledModal)

  return undefined
}
