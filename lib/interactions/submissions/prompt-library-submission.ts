/**
 * Prompt Library Submission Handler
 * Handles form submissions for creating new prompts
 */

import { createPrompt } from '../../db/prompt-library'
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
  // Log the form values for debugging
  console.log('Prompt library submission form values:', JSON.stringify(formValues, null, 2))
  console.log('User ID:', userId)

  try {
    // Extract form values with proper typing
    if (!formValues.title_block?.title_input) {
      console.error('Title input is missing from form values')
      return {
        response_action: 'errors',
        errors: {
          title_block: 'Title is required',
        },
      }
    }

    const title = (formValues.title_block.title_input as SlackViewStateValue).value
    if (!title) {
      console.error('Title is empty')
      return {
        response_action: 'errors',
        errors: {
          title_block: 'Title is required',
        },
      }
    }

    const description = (formValues.description_block.description_input as SlackViewStateValue)
      .value
    const content = (formValues.content_block.content_input as SlackViewStateValue).value
    if (!content) {
      console.error('Content is empty')
      return {
        response_action: 'errors',
        errors: {
          content_block: 'Content is required',
        },
      }
    }

    const categorySelect = formValues.category_block.category_select as SlackSelectStateValue
    const category = categorySelect.selected_option?.value
    const tagsInput = (formValues.tags_block.tags_input as SlackViewStateValue).value

    // Process tags (split by comma and trim)
    const tags = tagsInput ? tagsInput.split(',').map((tag: string) => tag.trim()) : []

    console.log('Creating prompt with:', {
      title,
      description: description || null,
      content,
      category,
      createdBy: userId,
    })

    // Create the prompt in the database
    const newPrompt = await createPrompt({
      title,
      description: description || null,
      content,
      category,
      createdBy: userId,
    })

    console.log('Successfully created prompt:', newPrompt)

    // Send confirmation message to the user
    await client.chat.postMessage({
      channel: userId,
      text: `✅ Your prompt "${title}" has been added to the library!`,
    })
    console.log('Sent confirmation message to user')

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
