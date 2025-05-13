import type { AssistantThreadStartedEvent, GenericMessageEvent } from '@slack/web-api'

import { generateResponse } from '../ai'
import { INITIAL_FOLLOWUPS, WELCOME_MESSAGES } from '../config'
import { client, getThread, setFollowupsUtil, updateStatusUtil } from '../slack'
import { getRandomItem, getRandomItems } from '../utils'

export async function assistantThreadMessage(event: AssistantThreadStartedEvent) {
  const { channel_id, thread_ts } = event.assistant_thread

  await client.chat.postMessage({
    channel: channel_id,
    thread_ts: thread_ts,
    text: getRandomItem(WELCOME_MESSAGES),
  })

  // Set 3 random initial followups
  await setFollowupsUtil(channel_id, thread_ts)(getRandomItems(INITIAL_FOLLOWUPS, 3))
}

export async function handleNewAssistantMessage(event: GenericMessageEvent, botUserId: string) {
  // Exclude bot messages and your own bot
  if (event.bot_id || event.bot_id === botUserId || event.bot_profile || !event.thread_ts) return

  const { thread_ts, channel } = event
  const updateStatus = updateStatusUtil(channel, thread_ts)

  const messages = await getThread(channel, thread_ts)
  console.log('📖 messages', messages)

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
