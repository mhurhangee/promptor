/**
 * Prompt Library Submission Handler
 * Handles form submissions for creating new prompts
 */

import { createPrompt } from '../../db/prompts'
import { client } from '../../slack/client'
import type { SlackSelectStateValue, SlackViewStateValue } from '../types'

/**
 * Response for a Slack view submission
 */
interface SlackViewSubmissionResponse {
  // For closing the modal without errors
  response_action?: 'clear' | 'errors'
  // For displaying errors in the modal
  errors?: Record<string, string>
}

/**
 * Handle prompt library create form submission
 *
 * @param formValues - The form values from the submission
 * @param userId - The ID of the user who submitted the form
 * @returns Response object for Slack API
 */
export async function handlePromptLibrarySubmission(
  formValues: Record<string, Record<string, SlackViewStateValue | SlackSelectStateValue>>,
  userId: string
): Promise<SlackViewSubmissionResponse> {
  try {
    // Extract form values with proper typing
    const title = (formValues.title_block.title_input as SlackViewStateValue).value
    const description = (formValues.description_block.description_input as SlackViewStateValue)
      .value
    const content = (formValues.content_block.content_input as SlackViewStateValue).value
    const categorySelect = formValues.category_block.category_select as SlackSelectStateValue
    const category = categorySelect.selected_option?.value
    const tagsInput = (formValues.tags_block.tags_input as SlackViewStateValue).value

    // Process tags (split by comma and trim)
    const tags = tagsInput ? tagsInput.split(',').map((tag: string) => tag.trim()) : []

    // Create the prompt in the database
    await createPrompt({
      title,
      description,
      content,
      category,
      tags,
      createdBy: userId,
      upvotes: 0,
    })

    // Send confirmation message to the user
    await client.chat.postMessage({
      channel: userId,
      text: `✅ Your prompt "${title}" has been added to the library!`,
    })

    // Return empty response to close the modal (Slack will close the modal by default)
    return {}
  } catch (error) {
    console.error('Error creating prompt:', error)

    // Return errors to display in the modal
    return {
      response_action: 'errors',
      errors: {
        title_block: 'There was an error creating your prompt. Please try again.',
      },
    }
  }
}
