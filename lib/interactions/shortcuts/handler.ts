import type { GlobalShortcutPayload, SlackInteractionPayload } from '../types'
import { handleCreatePromptShortcut } from './create-prompt-shortcut'

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
 * Routes to the appropriate handler based on the callback_id
 */
export const handleShortcut = (payload: GlobalShortcutPayload): object | undefined => {
  const { callback_id, trigger_id } = payload
  console.log(`Processing shortcut: ${callback_id}`)

  // Check if trigger_id is available
  if (!trigger_id) {
    console.error('No trigger_id available for shortcut')
    return undefined
  }

  // Route to the appropriate handler based on callback_id
  switch (callback_id) {
    case 'create_prompt':
      return handleCreatePromptShortcut(trigger_id)
    default:
      console.log(`Unhandled shortcut: ${callback_id}`)
  }

  return undefined
}
