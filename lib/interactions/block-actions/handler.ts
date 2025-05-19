import { createPromptModal, promptLibraryModal } from '../../config/views'
import { openModal, pushModal } from '../../slack'
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
      return handleCreatePromptButton(trigger_id, payload.container)
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
 * @param triggerId The trigger ID for the interaction
 * @param container The container information for the interaction
 */
const handleCreatePromptButton = (
  triggerId: string,
  container: BlockActionsPayload['container']
): undefined => {
  console.log(`Opening create prompt modal from button click with trigger_id: ${triggerId}`)

  // Check if the button was clicked from within a modal
  // If it was, we need to use pushModal instead of openModal
  if (container.type === 'view') {
    console.log('Button clicked from within a modal, pushing new modal on top')
    pushModal(triggerId, createPromptModal)
  } else {
    // Button was clicked from the home tab or a message
    console.log('Button clicked from outside a modal, opening new modal')
    openModal(triggerId, createPromptModal)
  }

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

  // In a real implementation, you would:
  // 1. Fetch the prompt text from a database using the promptId
  // 2. Open a DM with the user if one doesn't exist
  // 3. Post the prompt text to the conversation

  // For this example, we'll just log a message
  // In a real implementation, you would use client.chat.postMessage to send the prompt to the user
  console.log(`Would send prompt ${promptId} to conversation with user ${userId}`)

  return undefined
}
