import type { ModalView } from '@slack/web-api'

/**
 * Modal view for displaying the prompt library
 * Used by shortcuts and block actions
 */
export const promptLibraryModal = (
  prompts: Array<{ id: string; title: string; text: string }>
): ModalView => {
  // Create blocks for each prompt
  const promptBlocks = prompts.flatMap((prompt) => [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${prompt.title}*`,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Use',
          emoji: true,
        },
        value: prompt.id,
        action_id: `use_prompt_${prompt.id}`,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: prompt.text.length > 100 ? `${prompt.text.substring(0, 100)}...` : prompt.text,
        },
      ],
    },
    {
      type: 'divider',
    },
  ])

  // If no prompts, show a message
  const noPromptsBlock = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "You don't have any saved prompts yet.",
      },
    },
  ]

  return {
    type: 'modal',
    callback_id: 'prompt_library_modal',
    title: {
      type: 'plain_text',
      text: 'Prompt Library',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: 'Close',
      emoji: true,
    },
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Your Saved Prompts',
          emoji: true,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Create New Prompt',
              emoji: true,
            },
            action_id: 'create_prompt_button',
            style: 'primary',
          },
        ],
      },
      {
        type: 'divider',
      },
      ...(prompts.length > 0 ? promptBlocks : noPromptsBlock),
    ],
  }
}
