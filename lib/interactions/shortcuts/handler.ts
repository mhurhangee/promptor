import { createPromptModal, promptLibraryModal } from '../../config/views'
import { openModal } from '../../slack'
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
    case 'view_prompt_library':
      return handleViewPromptLibraryShortcut(trigger_id)
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
  openModal(triggerId, createPromptModal)

  return undefined
}

/**
 * Handle the view prompt library shortcut
 * Opens a modal showing the user's saved prompts
 */
const handleViewPromptLibraryShortcut = (triggerId: string): undefined => {
  console.log(`Opening prompt library with trigger_id: ${triggerId}`)

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
