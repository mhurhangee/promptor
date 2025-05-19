import { createPromptModal } from '../../config/views'
import { showModal } from '../../slack'

/**
 * Handle the create prompt shortcut
 * Opens a modal for creating a new prompt
 */
export const handleCreatePromptShortcut = (triggerId: string): undefined => {
  console.log(`Opening create prompt modal with trigger_id: ${triggerId}`)

  // Open the create prompt modal using the trigger_id
  showModal(triggerId, createPromptModal)

  return undefined
}
