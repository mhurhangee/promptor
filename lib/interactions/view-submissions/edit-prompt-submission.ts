import { updatePrompt } from '../../db'
import { publishView } from '../../slack'
import type { ViewState } from '../types'

/**
 * Handle the edit prompt modal submission
 * Processes the form data and updates the prompt in the database
 */
export const handleEditPromptSubmission = async (
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
