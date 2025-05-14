import type { GenericMessageEvent } from '@slack/web-api'

import { generateResponse } from '../ai'
import type { HeliconeTrackingData } from '../ai/helicone-utils'
import { getThread, postFullResponse, updateStatusUtil } from '../slack'

export async function handleNewAssistantMessage(event: GenericMessageEvent, botUserId: string) {
  // Exclude bot messages and your own bot (TODO: is this necessary?)
  if (event.bot_id || event.bot_id === botUserId || event.bot_profile || !event.thread_ts) return

  const { thread_ts, channel, user, ts } = event
  const updateStatus = updateStatusUtil(channel, thread_ts)

  // Create tracking data for Helicone observability
  const trackingData: HeliconeTrackingData = {
    userId: user || 'unknown',
    channelId: channel,
    threadTs: thread_ts,
    messageTs: ts,
    botId: botUserId,
  }

  const messages = await getThread(channel, thread_ts, updateStatus, botUserId)

  const output = await generateResponse(messages, updateStatus, trackingData)

  await postFullResponse(output, channel, thread_ts)
}
