import type { SlackInteractionPayload, ViewSubmissionPayload } from '../types'
import { handleCreatePromptSubmission } from './create-prompt-submission'
import { handleEditPromptSubmission } from './edit-prompt-submission'

/**
 * Type guard for view submissions
 */
export function isViewSubmission(
  payload: SlackInteractionPayload
): payload is ViewSubmissionPayload {
  return payload.type === 'view_submission'
}

/**
 * Handle view submissions (modal form submissions)
 * Routes to the appropriate handler based on the callback_id
 */
export const handleViewSubmission = async (payload: ViewSubmissionPayload): Promise<object> => {
  const { view, user } = payload
  const { callback_id } = view

  console.log(`Processing view submission: ${callback_id}`)

  try {
    // Route to the appropriate handler based on callback_id
    switch (callback_id) {
      case 'create_prompt_modal':
        return await handleCreatePromptSubmission(view.state, user.id)
      case 'edit_prompt_modal':
        return await handleEditPromptSubmission(view.state, view.private_metadata, user.id)
      default:
        console.log(`Unhandled view submission: ${callback_id}`)
        return {}
    }
  } catch (error) {
    console.error(`Error handling view submission: ${error}`)
    return {
      response_action: 'errors',
      errors: {
        prompt_title_block: 'An error occurred while processing your submission',
      },
    }
  }
}
