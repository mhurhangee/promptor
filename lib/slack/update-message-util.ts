// Mainly used for app mentions, which is currently disabled, but left here for future use

import type { AppMentionEvent } from '@slack/web-api'

import { client } from './client'

export const updateMessageUtil = async (initialStatus: string, event: AppMentionEvent) => {
  const initialMessage = await client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.thread_ts ?? event.ts,
    text: initialStatus,
  })

  if (!initialMessage || !initialMessage.ts) throw new Error('Failed to post initial message')

  const updateMessage = async (status: string) => {
    await client.chat.update({
      channel: event.channel,
      ts: initialMessage.ts as string,
      text: status,
    })
  }
  return updateMessage
}
