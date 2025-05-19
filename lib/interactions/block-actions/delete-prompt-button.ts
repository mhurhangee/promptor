import { deletePrompt } from '../../db'
import { publishView } from '../../slack'
import type { Action } from '../types'

/**
 * Handle the delete prompt button click
 * Deletes the prompt from the database and refreshes the home view
 */
export const handleDeletePromptButton = async (
  action: Action,
  userId: string
): Promise<undefined> => {
  try {
    // Extract the prompt ID from the action_id (format: delete_prompt_<id>)
    const promptId = Number.parseInt(action.action_id.replace('delete_prompt_', ''), 10)

    if (Number.isNaN(promptId)) {
      throw new Error(`Invalid prompt ID: ${action.action_id}`)
    }

    console.log(`User ${userId} is deleting prompt ${promptId}`)

    // Delete the prompt from the database
    await deletePrompt(promptId)

    // Refresh the home view to reflect the deletion
    await publishView(userId)

    return undefined
  } catch (error) {
    console.error(`Error deleting prompt: ${error}`)
    return undefined
  }
}
