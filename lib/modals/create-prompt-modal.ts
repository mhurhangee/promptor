/**
 * Create Prompt Modal
 *
 * Defines the modal for creating a new prompt in the prompt library.
 * This uses the modal registry system to handle opening and submission.
 */

import { createPromptView } from '../config/prompt-library-views'
import { createPrompt } from '../db/prompt-library'
import type { SlackSelectStateValue, SlackViewStateValue } from '../interactions/types'
import { client } from '../slack/client'
import { type ModalDefinition, modals } from '../slack/modals'

/**
 * Define the create prompt modal
 */
const createPromptModal: ModalDefinition = {
  // The ID must match the callback_id in the view
  id: 'prompt_library_create',

  // Function to get the view definition
  getView: () => createPromptView,

  // Validation schema for form fields
  validationSchema: {
    title_block: (value: unknown) => {
      const input = value as Record<string, SlackViewStateValue>
      const title = input.title_input?.value
      return !title ? 'Title is required' : null
    },
    content_block: (value: unknown) => {
      const input = value as Record<string, SlackViewStateValue>
      const content = input.content_input?.value
      return !content ? 'Content is required' : null
    },
  },

  // Handler for form submission
  handleSubmission: async (formValues, userId) => {
    // Extract form values with proper typing
    const title = (formValues.title_block.title_input as SlackViewStateValue).value
    const description = (formValues.description_block.description_input as SlackViewStateValue)
      .value
    const content = (formValues.content_block.content_input as SlackViewStateValue).value
    const categorySelect = formValues.category_block.category_select as SlackSelectStateValue
    const category = categorySelect.selected_option?.value

    console.log('Creating prompt with:', {
      title,
      description: description || null,
      content,
      category,
      createdBy: userId,
    })

    try {
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

      return { success: true }
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
  },
}

// Register the modal with the registry
modals.register(createPromptModal)

// Export the modal ID for use in action IDs
export const CREATE_PROMPT_MODAL_ID = createPromptModal.id
