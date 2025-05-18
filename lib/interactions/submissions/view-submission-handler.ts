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
 * @returns Response object or null
 */
export const viewSubmissionHandler = async (
  payload: SlackViewSubmission
): Promise<SlackViewResponse | null> => {
  const { view } = payload

  switch (view.callback_id) {
    case 'byte_form': {
      const promptInput = view.state.values.prompt_block.user_prompt as SlackViewStateValue
      return await handleByteSubmission(promptInput.value)
    }
    case 'dino_fact': {
      return await handleDinoFactSubmission()
    }
    case 'ai_form': {
      const promptInput = view.state.values.prompt_block.user_prompt as SlackViewStateValue
      return await handleAiFormSubmission(promptInput.value)
    }
    case 'prompt_library_create': {
      // Use the dedicated prompt library submission handler
      return await handlePromptLibrarySubmission(view.state.values, payload.user.id)
    }
    default: {
      console.warn(`Unknown view submission callback_id: ${view.callback_id}`)
      return null
    }
  }
}
