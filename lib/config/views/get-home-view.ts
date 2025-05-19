import type { HomeView } from '@slack/web-api'
import { getAllPrompts } from '../../db'
import type { Prompt } from '../../db/schema'

/**
 * Generate blocks for displaying prompts in the home view
 */
const generatePromptBlocks = (prompts: Prompt[]) => {
  if (prompts.length === 0) {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "You don't have any saved prompts yet.",
        },
      },
    ]
  }

  return prompts.flatMap((prompt) => [
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
        value: prompt.id.toString(),
        action_id: `use_prompt_${prompt.id}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '✏️ Edit',
            emoji: true,
          },
          value: prompt.id.toString(),
          action_id: `edit_prompt_${prompt.id}`,
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🗑️ Delete',
            emoji: true,
          },
          value: prompt.id.toString(),
          action_id: `delete_prompt_${prompt.id}`,
          style: 'danger',
          confirm: {
            title: {
              type: 'plain_text',
              text: 'Delete Prompt',
            },
            text: {
              type: 'plain_text',
              text: `Are you sure you want to delete "${prompt.title}"?`,
            },
            confirm: {
              type: 'plain_text',
              text: 'Delete',
            },
            deny: {
              type: 'plain_text',
              text: 'Cancel',
            },
          },
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text:
            prompt.content.length > 100 ? `${prompt.content.substring(0, 100)}...` : prompt.content,
        },
      ],
    },
    {
      type: 'divider',
    },
  ])
}

/**
 * Get the home view with prompts from the database
 */
export async function getHomeView(): Promise<HomeView> {
  // Fetch all prompts from the database
  const prompts = await getAllPrompts()

  return {
    type: 'home',
    blocks: [
      // Header
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🦕 Promptor',
          emoji: true,
        },
      },

      // Intro paragraph
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Your AI tutor in Slack. Get answers, explanations, and ideas—instantly.',
        },
      },

      // Prompt Library Header
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📚 Prompt Library',
          emoji: true,
        },
      },

      // Create Prompt Button
      {
        type: 'actions',
        block_id: 'home_prompt_actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '✏️ Create New Prompt',
              emoji: true,
            },
            action_id: 'home_create_prompt_button',
            style: 'primary',
          },
        ],
      },

      // Divider before prompts
      {
        type: 'divider',
      },

      // Prompt Library Content
      ...generatePromptBlocks(prompts),
    ],
  }
}
