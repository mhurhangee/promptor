import { createPrompt } from '../../db'
import { publishView } from '../../slack'
import type { ViewState } from '../types'

/**
 * Handle the create prompt modal submission
 * Processes the form data and saves the prompt to the database
 */
export const handleCreatePromptSubmission = async (
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
