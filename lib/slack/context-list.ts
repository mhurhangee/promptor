import type { AnyBlock } from '@slack/web-api'

// Helper: Generate a list of context blocks from a title and items
export function contextList({ title, items }: { title: string; items: string[] }): AnyBlock[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: title,
      },
    },
    ...items.map((item) => ({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: item,
        },
      ],
    })),
  ]
}
