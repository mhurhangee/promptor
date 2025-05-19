import { createPromptModal } from '../../config/views'
import { showModal } from '../../slack'

/**
 * Handle the create prompt button click
 * Opens the create prompt modal
 * @param triggerId The trigger ID for the interaction
 */
export const handleCreatePromptButton = (triggerId: string): undefined => {
  // Open the create prompt modal
  showModal(triggerId, createPromptModal)

  return undefined
}
