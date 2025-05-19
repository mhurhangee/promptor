import { createPrompt, updatePrompt } from '../../db'
import { publishView } from '../../slack'
import type { SlackInteractionPayload, ViewState, ViewSubmissionPayload } from '../types'

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
 */
export const handleViewSubmission = async (payload: ViewSubmissionPayload): Promise<object> => {
  const { view, user } = payload
  const { callback_id } = view

  console.log(`Processing view submission: ${callback_id}`)

  try {
    // Handle different view submissions based on callback_id
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

/**
 * Handle the create prompt modal submission
 * Processes the form data and saves the prompt to the database
 */
const handleCreatePromptSubmission = async (
  state: ViewState | undefined,
  userId: string
): Promise<object> => {
  if (!state || !state.values) {
    console.error('No state values in view submission')
    return { response_action: 'errors', errors: { prompt_title_block: 'Missing form data' } }
  }

  try {
    // Extract form values
    const titleBlock = state.values.prompt_title_block
    const textBlock = state.values.prompt_text_block

    if (!titleBlock || !textBlock) {
      console.error('Missing required blocks in form submission')
      return {
        response_action: 'errors',
        errors: { prompt_title_block: 'Missing required fields' },
      }
    }

    const title = titleBlock.prompt_title?.value
    const text = textBlock.prompt_text?.value

    if (!title || !text) {
      console.error('Missing required values in form submission')
      return {
        response_action: 'errors',
        errors: {
          prompt_title_block: !title ? 'Title is required' : undefined,
          prompt_text_block: !text ? 'Prompt text is required' : undefined,
        },
      }
    }

    // Save the prompt to the database
    await createPrompt({
      title,
      content: text,
      createdBy: userId,
      // Optional fields can be added if provided in the form
      description: null,
      category: null,
    })

    // Refresh the home view to show the new prompt
    await publishView(userId)

    // Return a success message
    return {
      response_action: 'update',
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Success',
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ Your prompt *${title}* has been saved!`,
            },
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error processing form submission:', error)
    return { response_action: 'errors', errors: { prompt_title_block: 'An error occurred' } }
  }
}
/**
 * Handle the edit prompt modal submission
 * Processes the form data and updates the prompt in the database
 */
const handleEditPromptSubmission = async (
  state: ViewState | undefined,
  privateMetadata: string | undefined,
  userId: string
): Promise<object> => {
  if (!state || !state.values) {
    console.error('No state values in edit prompt view submission')
    return { response_action: 'errors', errors: { prompt_title_block: 'Missing form data' } }
  }

  if (!privateMetadata) {
    console.error('No prompt ID in private_metadata')
    return { response_action: 'errors', errors: { prompt_title_block: 'Missing prompt ID' } }
  }

  // Parse the prompt ID from private_metadata
  const promptId = Number.parseInt(privateMetadata, 10)
  if (Number.isNaN(promptId)) {
    console.error(`Invalid prompt ID: ${privateMetadata}`)
    return { response_action: 'errors', errors: { prompt_title_block: 'Invalid prompt ID' } }
  }

  try {
    // Extract form values
    const titleBlock = state.values.prompt_title_block
    const textBlock = state.values.prompt_text_block

    if (!titleBlock || !textBlock) {
      console.error('Missing required blocks in form submission')
      return {
        response_action: 'errors',
        errors: { prompt_title_block: 'Missing required fields' },
      }
    }

    const title = titleBlock.prompt_title?.value
    const text = textBlock.prompt_text?.value

    if (!title || !text) {
      console.error('Missing required values in form submission')
      return {
        response_action: 'errors',
        errors: {
          prompt_title_block: !title ? 'Title is required' : undefined,
          prompt_text_block: !text ? 'Prompt text is required' : undefined,
        },
      }
    }

    // Update the prompt in the database
    await updatePrompt(promptId, {
      title,
      content: text,
      // We don't update createdBy as it should remain the same
    })

    // Refresh the home view to show the updated prompt
    await publishView(userId)

    // Return a success message
    return {
      response_action: 'update',
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Success',
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ Your prompt *${title}* has been updated!`,
            },
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error processing edit form submission:', error)
    return { response_action: 'errors', errors: { prompt_title_block: 'An error occurred' } }
  }
}
