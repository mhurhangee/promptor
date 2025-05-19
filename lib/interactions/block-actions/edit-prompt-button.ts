import { getEditPromptModal } from '../../config/views'
import { getPromptById } from '../../db'
import { showModal } from '../../slack'
import type { Action } from '../types'

/**
 * Handle the edit prompt button click
 * Opens the edit prompt modal with the existing prompt data
 */
export const handleEditPromptButton = async (
  action: Action,
  triggerId: string
): Promise<undefined> => {
  try {
    // Extract the prompt ID from the action_id (format: edit_prompt_<id>)
    const promptId = Number.parseInt(action.action_id.replace('edit_prompt_', ''), 10)

    if (Number.isNaN(promptId)) {
      throw new Error(`Invalid prompt ID: ${action.action_id}`)
    }

    console.log(`Opening edit modal for prompt ${promptId}`)

    // Fetch the prompt from the database
    const prompt = await getPromptById(promptId)

    if (!prompt) {
      throw new Error(`Prompt not found with ID: ${promptId}`)
    }

    // Create the edit modal with the existing prompt data
    const editModal = getEditPromptModal(prompt)

    // Open the edit modal
    showModal(triggerId, editModal)

    return undefined
  } catch (error) {
    console.error(`Error opening edit prompt modal: ${error}`)
    return undefined
  }
}
