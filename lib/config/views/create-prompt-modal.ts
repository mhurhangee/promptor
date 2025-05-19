import type { ModalView } from '@slack/web-api'

/**
 * Modal view for creating a new prompt
 * Used by both shortcuts and block actions
 */
export const createPromptModal: ModalView = {
  type: 'modal',
  callback_id: 'create_prompt_modal',
  title: {
    type: 'plain_text',
    text: 'Create Prompt',
    emoji: true,
  },
  submit: {
    type: 'plain_text',
    text: 'Save',
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
          text: 'This prompt will be saved to your personal library.',
        },
      ],
    },
  ],
}
