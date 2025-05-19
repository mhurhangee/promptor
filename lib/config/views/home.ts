import type { HomeView } from '@slack/web-api'
import { contextList } from '../../slack'

// 2. Quick Start section using contextList
const quickStart = {
  title: '⚡ *Quick start*',
  items: [
    '💬 *DM Promptor* to get instant help',
    '📎 *Pin Promptor* to your sidebar for quick access',
  ],
}

// 3. Features section using contextList
const features = {
  title: '✨ *Features*',
  items: [
    '🤖 *AI tutor* for all your AI questions',
    '🌐 *Web search* for up-to-date information and answers',
    '📄 *File & image* support',
    '📸 *Voice* and *video* support',
    '🔁 *Follow-ups* to keep the conversation going',
  ],
}

// 4. Tips section using contextList
const tips = {
  title: '💡 *Tips*',
  items: [
    '📝 Be clear with your questions',
    '🔄 Ask follow-ups for more detail',
    '📋 Request lists for organized info',
  ],
}

// Home view to be displayed when user opens the home tab
export const homeView: HomeView = {
  type: 'home',
  blocks: [
    // 0. Header
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🦕 Welcome to Promptor!',
        emoji: true,
      },
    },

    // 1. Intro paragraph
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Promptor is your friendly AI tutor in Slack. Get answers, explanations, and ideas—instantly.',
      },
    },

    // Prompt Library Actions
    {
      type: 'actions',
      block_id: 'home_prompt_actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '✏️ Create Prompt',
            emoji: true,
          },
          action_id: 'home_create_prompt_button',
          style: 'primary',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📚 View Prompt Library',
            emoji: true,
          },
          action_id: 'home_view_library_button',
        },
      ],
    },
    {
      type: 'divider',
    },

    // 2. Quick Start section
    ...contextList(quickStart),

    {
      type: 'divider',
    },

    // 3. Features section
    ...contextList(features),

    {
      type: 'divider',
    },

    // 4. Tips and Tricks section
    ...contextList(tips),
  ],
}
