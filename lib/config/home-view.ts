import { contextList } from '@/lib/slack'
import type { HomeView } from '@slack/web-api'

// 2. Quick Start section using contextList
const quickStart = {
  title: '⚡ *Quick Start*',
  items: [
    '💬 *DM Promptor* to get instant help',
    '🔄 *Mention* `@Promptor` in any channel',
    '📎 *Pin Promptor* to your sidebar for quick access',
  ],
}

// 3. Features section using contextList
const features = {
  title: '✨ *Features*',
  items: [
    '🤖 *AI Tutor* for all your questions',
    '🌐 *Web Search* in Slack',
    '📄 *File & Image* support',
    '🔁 *Follow-up* on topics',
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
