import { waitUntil } from '@vercel/functions'
import type { SlackViewStateValue, SlackViewSubmission } from '../types'
// Import submission handlers
import { handleAiFormSubmission } from './ai-form-submission'
import { handleByteSubmission } from './byte-submission'
import { handleDinoFactSubmission } from './dino-fact-submission'
import { handlePromptLibrarySubmission } from './prompt-library-submission'

/**
 * Response for a Slack view submission
 */
interface SlackViewResponse {
  response_action?: string
  errors?: Record<string, string>
}

/**
 * Routes view submission interactions to the appropriate handler
 *
 * @param payload - The Slack view submission payload
 * @returns Promise that resolves when processing is complete
 */
export const viewSubmissionHandler = async (payload: SlackViewSubmission): Promise<void> => {
  const { view } = payload
  let response: SlackViewResponse | null = null

  switch (view.callback_id) {
    case 'byte_form': {
      const promptInput = view.state.values.prompt_block.user_prompt as SlackViewStateValue
      response = await handleByteSubmission(promptInput.value)
      break
    }
    case 'dino_fact': {
      response = await handleDinoFactSubmission()
      break
    }
    case 'ai_form': {
      const promptInput = view.state.values.prompt_block.user_prompt as SlackViewStateValue
      response = await handleAiFormSubmission(promptInput.value)
      break
    }
    case 'prompt_library_create': {
      // Use the dedicated prompt library submission handler
      response = await handlePromptLibrarySubmission(view.state.values, payload.user.id)
      break
    }
    default: {
      console.warn(`Unknown view submission callback_id: ${view.callback_id}`)
    }
  }

  // If we have a response, we need to send it back to Slack
  // This would typically be handled by the Slack API client
  if (response) {
    // For view submissions, Slack expects a response in the HTTP response
    // This is different from other interaction types
    // The interaction handler will need to be updated to handle this case
    console.log('View submission response:', response)
  }
}
