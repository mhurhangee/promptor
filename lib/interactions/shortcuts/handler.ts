import { createPromptModal } from '../../config/views'
import { showModal } from '../../slack'
import type { GlobalShortcutPayload, SlackInteractionPayload } from '../types'

/**
 * Type guard for global shortcuts
 */
export function isGlobalShortcut(
  payload: SlackInteractionPayload
): payload is GlobalShortcutPayload {
  return payload.type === 'shortcut'
}

/**
 * Handle global shortcuts triggered from the Slack search menu
 */
export const handleShortcut = (payload: GlobalShortcutPayload): object | undefined => {
  const { callback_id, trigger_id } = payload
  console.log(`Processing shortcut: ${callback_id}`)

  // Check if trigger_id is available
  if (!trigger_id) {
    console.error('No trigger_id available for shortcut')
    return undefined
  }

  // Handle different shortcuts based on callback_id
  switch (callback_id) {
    case 'create_prompt':
      return handleCreatePromptShortcut(trigger_id)
    default:
      console.log(`Unhandled shortcut: ${callback_id}`)
  }

  return undefined
}

/**
 * Handle the create prompt shortcut
 * Opens a modal for creating a new prompt
 */
const handleCreatePromptShortcut = (triggerId: string): undefined => {
  console.log(`Opening create prompt modal with trigger_id: ${triggerId}`)

  // Open the create prompt modal using the trigger_id
  showModal(triggerId, createPromptModal)

  return undefined
}
