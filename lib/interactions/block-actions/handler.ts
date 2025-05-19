import { createPromptModal, promptLibraryModal } from '../../config/views'
import { openModal } from '../../slack'
import type { Action, BlockActionsPayload, SlackInteractionPayload } from '../types'

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
  const { actions, trigger_id, user } = payload

  // Check if trigger_id is available
  if (!trigger_id) {
    console.error('No trigger_id available for block action')
    return undefined
  }

  // Process each action in the payload
  for (const action of actions) {
    const { action_id } = action
    console.log(`Processing block action: ${action_id}`)

    // Handle different block actions based on action_id
    if (action_id === 'create_prompt_button' || action_id === 'home_create_prompt_button') {
      return handleCreatePromptButton(trigger_id)
    }

    if (action_id === 'home_view_library_button') {
      return handleViewLibraryButton(trigger_id)
    }

    if (action_id.startsWith('use_prompt_')) {
      return handleUsePromptButton(action, user.id)
    }

    // Log unhandled action
    console.log(`Unhandled block action: ${action_id}`)
  }

  // Return undefined as we don't need to send a response to Slack
  return undefined
}

/**
 * Handle the create prompt button click
 * Opens the create prompt modal
 */
const handleCreatePromptButton = (triggerId: string): undefined => {
  console.log(`Opening create prompt modal from button click with trigger_id: ${triggerId}`)

  // Open the create prompt modal
  openModal(triggerId, createPromptModal)

  return undefined
}

/**
 * Handle the view prompt library button click
 * Opens the prompt library modal
 */
const handleViewLibraryButton = (triggerId: string): undefined => {
  console.log(`Opening prompt library from button click with trigger_id: ${triggerId}`)

  // For this example, we'll use dummy data
  // In a real app, you would fetch this from a database
  const examplePrompts = [
    {
      id: 'prompt1',
      title: 'Explain a Concept',
      text: 'Explain [concept] in simple terms as if I were a beginner.',
    },
    {
      id: 'prompt2',
      title: 'Code Review',
      text: 'Review this code and suggest improvements: [code]',
    },
  ]

  // Open the prompt library modal with the example prompts
  openModal(triggerId, promptLibraryModal(examplePrompts))

  return undefined
}

/**
 * Handle the use prompt button click
 * This would typically send the prompt to the current conversation
 */
const handleUsePromptButton = (action: Action, userId: string): undefined => {
  // Extract the prompt ID from the action_id (format: use_prompt_<id>)
  const promptId = action.action_id.replace('use_prompt_', '')
  const promptValue = action.value

  console.log(`User ${userId} wants to use prompt ${promptId} with value ${promptValue}`)

  // In a real implementation, you would fetch the prompt from a database
  // and then send it to the user's conversation
  // For this example, we'll just log a message
  console.log(`Would send prompt ${promptId} to conversation`)

  return undefined
}
