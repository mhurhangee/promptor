import type { CoreMessage } from 'ai'

import { client } from './client'

export async function getThread(
  channel_id: string,
  thread_ts: string,
  botUserId: string
): Promise<CoreMessage[]> {
  const { messages } = await client.conversations.replies({
    channel: channel_id,
    ts: thread_ts,
    limit: 50,
  })

  // Ensure we have messages

  if (!messages) throw new Error('No messages found in thread')

  const result = messages
    .map((message) => {
      const isBot = !!message.bot_id
      if (!message.text) return null

      // For app mentions, remove the mention prefix
      // For IM messages, keep the full text
      let content = message.text
      if (!isBot && content.includes(`<@${botUserId}>`)) {
        content = content.replace(`<@${botUserId}> `, '')
      }

      return {
        role: isBot ? 'assistant' : 'user',
        content: content,
      } as CoreMessage
    })
    .filter((msg): msg is CoreMessage => msg !== null)

  return result
}
