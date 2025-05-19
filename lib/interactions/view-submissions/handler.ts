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
export const handleViewSubmission = (payload: ViewSubmissionPayload): object => {
  const { view, user } = payload
  const { callback_id } = view

  console.log(`Processing view submission: ${callback_id}`)

  // Handle different view submissions based on callback_id
  switch (callback_id) {
    case 'create_prompt_modal':
      return handleCreatePromptSubmission(view.state, user.id)
    default:
      console.log(`Unhandled view submission: ${callback_id}`)
      return {}
  }
}

/**
 * Handle the create prompt modal submission
 * Processes the form data and saves the prompt
 */
const handleCreatePromptSubmission = (state: ViewState | undefined, userId: string): object => {
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

    // In a real implementation, you would save the prompt to a database
    console.log(`Saving prompt for user ${userId}:`)
    console.log(`Title: ${title}`)
    console.log(`Text: ${text}`)

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
