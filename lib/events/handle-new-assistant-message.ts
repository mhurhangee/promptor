import type { GenericMessageEvent } from '@slack/web-api'

import { generateResponse } from '../ai'
import { getThread, postFullResponse, updateStatusUtil } from '../slack'

export async function handleNewAssistantMessage(event: GenericMessageEvent, botUserId: string) {
  // Exclude bot messages and your own bot (TODO: is this necessary?)
  if (event.bot_id || event.bot_id === botUserId || event.bot_profile || !event.thread_ts) return

  const { thread_ts, channel } = event
  const updateStatus = updateStatusUtil(channel, thread_ts)

  const messages = await getThread(channel, thread_ts)

  const output = await generateResponse(messages, updateStatus)

  await postFullResponse(output, channel, thread_ts)
}
