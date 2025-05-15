import type { GenericMessageEvent } from '@slack/web-api'

import { generateResponse } from '../ai'
import type { HeliconeTrackingData } from '../ai/helicone-utils'
import { getThread, postFullResponse, updateStatusUtil } from '../slack'

export async function handleNewAssistantMessage(slackEvent: GenericMessageEvent) {
  if (!slackEvent.thread_ts || !slackEvent.channel || !slackEvent.user || !slackEvent.ts) {
    throw new Error('Missing required fields')
  }

  const { thread_ts, channel, user, ts } = slackEvent
  const updateStatus = updateStatusUtil(channel, thread_ts)

  // Create tracking data for Helicone observability
  const trackingData: HeliconeTrackingData = {
    userId: user,
    channelId: channel,
    threadTs: thread_ts,
    messageTs: ts,
  }

  const messages = await getThread(channel, thread_ts, trackingData, updateStatus)

  const output = await generateResponse(messages, trackingData, updateStatus)

  await postFullResponse(output, channel, thread_ts)
}
