import type { ModalView } from '@slack/web-api'
import type { Prompt } from '../../db/schema'

/**
 * Generate a modal view for editing an existing prompt
 * Pre-fills the form with the existing prompt data
 */
export const getEditPromptModal = (prompt: Prompt): ModalView => {
  return {
    type: 'modal',
    callback_id: 'edit_prompt_modal',
    private_metadata: prompt.id.toString(), // Store the prompt ID for later use
    title: {
      type: 'plain_text',
      text: 'Edit Prompt',
      emoji: true,
    },
    submit: {
      type: 'plain_text',
      text: 'Save Changes',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: 'Cancel',
      emoji: true,
    },
    blocks: [
      {
        type: 'input',
        block_id: 'prompt_title_block',
        element: {
          type: 'plain_text_input',
          action_id: 'prompt_title',
          initial_value: prompt.title,
          placeholder: {
            type: 'plain_text',
            text: 'Enter a title for your prompt',
          },
        },
        label: {
          type: 'plain_text',
          text: 'Title',
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'prompt_text_block',
        element: {
          type: 'plain_text_input',
          action_id: 'prompt_text',
          multiline: true,
          initial_value: prompt.content,
          placeholder: {
            type: 'plain_text',
            text: 'Write your prompt here...',
          },
        },
        label: {
          type: 'plain_text',
          text: 'Prompt',
          emoji: true,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Your changes will be saved to your personal library.',
          },
        ],
      },
    ],
  }
}
