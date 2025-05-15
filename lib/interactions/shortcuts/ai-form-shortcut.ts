/**
 * AI form shortcut handler
 * Handles the creation of AI form modals via Slack shortcuts
 */

import { client } from '../../slack'

/**
 * Handles the AI form shortcut
 * Opens a modal for the user to enter a prompt
 */
export async function handleAiFormShortcut(trigger_id: string): Promise<void> {
  await client.views.open({
    trigger_id,
    view: {
      type: 'modal',
      callback_id: 'ai_form',
      title: {
        type: 'plain_text',
        text: 'AI Assistant',
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "✨ *Ask me anything about AI!* ✨\nI'll do my best to provide a helpful response.",
          },
        },
        {
          type: 'input',
          block_id: 'prompt_block',
          label: {
            type: 'plain_text',
            text: 'What would you like to know?',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'user_prompt',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'E.g., Explain how large language models work...',
            },
          },
        },
      ],
    },
  })
}
