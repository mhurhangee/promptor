import type { AssistantThreadStartedEvent, GenericMessageEvent } from '@slack/web-api'

import { generateResponse } from '@/lib/ai'
import { initialFollowups, welcomeMessages } from '@/lib/config'
import { client, getThread, setFollowupsUtil, updateStatusUtil } from '@/lib/slack'
import { getRandomItem, getRandomItems } from '@/lib/utils'

export async function assistantThreadMessage(event: AssistantThreadStartedEvent) {
  const { channel_id, thread_ts } = event.assistant_thread

  await client.chat.postMessage({
    channel: channel_id,
    thread_ts: thread_ts,
    text: getRandomItem(welcomeMessages),
  })

  // Set 3 random initial followups
  await setFollowupsUtil(channel_id, thread_ts)(getRandomItems(initialFollowups, 3))
}

export async function handleNewAssistantMessage(event: GenericMessageEvent, botUserId: string) {
  if (event.bot_id || event.bot_id === botUserId || event.bot_profile || !event.thread_ts) return

  const { thread_ts, channel } = event
  const updateStatus = updateStatusUtil(channel, thread_ts)

  const messages = await getThread(channel, thread_ts, botUserId)
  const result = await generateResponse(messages, updateStatus)

  await client.chat.postMessage({
    channel: channel,
    thread_ts: thread_ts,
    text: result,
    unfurl_links: false,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: result,
        },
      },
    ],
  })
}
