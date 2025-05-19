import type { HomeView } from '@slack/web-api'
import { examplePrompts } from '../example-data'

/**
 * Generate blocks for displaying prompts in the home view
 */
const generatePromptBlocks = (prompts: Array<{ id: string; title: string; text: string }>) => {
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
}

// Home view to be displayed when user opens the home tab
export const homeView: HomeView = {
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
    ...generatePromptBlocks(examplePrompts),
  ],
}
