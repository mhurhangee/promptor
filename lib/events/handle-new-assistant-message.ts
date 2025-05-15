import type { GenericMessageEvent } from '@slack/web-api'

import { generateResponse } from '../ai'
import { getThread, postFullResponse, updateStatusUtil } from '../slack'

export async function handleNewAssistantMessage(slackEvent: GenericMessageEvent) {
  if (!slackEvent.thread_ts || !slackEvent.channel) {
    throw new Error('Missing required fields')
  }

  const { thread_ts, channel } = slackEvent
  const updateStatus = updateStatusUtil(channel, thread_ts)

  const messages = await getThread(channel, thread_ts, updateStatus)

  const output = await generateResponse(messages, updateStatus)

  await postFullResponse(output, channel, thread_ts)
}
