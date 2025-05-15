import type { ReactionAddedEvent } from '@slack/web-api'
import { client } from '../slack'

export async function handleReaction(slackEvent: ReactionAddedEvent) {
  const { item, reaction } = slackEvent

  const result = await client.conversations.replies({
    channel: item.channel,
    ts: item.ts,
    limit: 1,
  })

  const originalText = result.messages?.[0]?.text

  await client.chat.update({
    channel: item.channel,
    ts: item.ts,
    text: `${originalText} : ${reaction}:`,
  })
}
