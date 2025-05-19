import type { BlockActionsPayload, SlackInteractionPayload } from '../types'
import { handleCreatePromptButton } from './create-prompt-button'
import { handleDeletePromptButton } from './delete-prompt-button'
import { handleEditPromptButton } from './edit-prompt-button'
import { handleUsePromptButton } from './use-prompt-button'

/**
 * Type guard for block actions
 */
export function isBlockActions(payload: SlackInteractionPayload): payload is BlockActionsPayload {
  return payload.type === 'block_actions'
}

/**
 * Handle block actions (buttons, select menus, etc.)
 */
export const handleBlockActions = (payload: BlockActionsPayload): object | undefined => {
  const { trigger_id, user, actions } = payload

  // Check if we have actions to process
  if (!actions || actions.length === 0) {
    console.error('No actions found in block actions payload')
    return undefined
  }

  // Check if trigger_id is available
  if (!trigger_id) {
    console.error('No trigger_id available for block action')
    return undefined
  }

  // Process each action
  for (const action of actions) {
    const { action_id } = action
    console.log(`Processing block action: ${action_id}`)

    // Handle different block actions based on action_id
    if (action_id === 'create_prompt_button' || action_id === 'home_create_prompt_button') {
      return handleCreatePromptButton(trigger_id)
    }

    if (action_id.startsWith('use_prompt_')) {
      // Make sure user.id is available
      if (!user || !user.id) {
        console.error('User ID not available for use prompt action')
        return undefined
      }
      return handleUsePromptButton(action, user.id)
    }

    if (action_id.startsWith('edit_prompt_')) {
      // Make sure trigger_id is available for opening the modal
      if (!trigger_id) {
        console.error('No trigger_id available for edit prompt action')
        return undefined
      }
      return handleEditPromptButton(action, trigger_id)
    }

    if (action_id.startsWith('delete_prompt_')) {
      // Make sure user.id is available
      if (!user || !user.id) {
        console.error('User ID not available for delete prompt action')
        return undefined
      }
      return handleDeletePromptButton(action, user.id)
    }

    // Log unhandled action
    console.log(`Unhandled block action: ${action_id}`)
  }

  // Return undefined as we don't need to send a response to Slack
  return undefined
}
