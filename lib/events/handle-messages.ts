import type { AssistantThreadStartedEvent, GenericMessageEvent } from '@slack/web-api'

import { generateResponse } from '../ai'
import { INITIAL_CONTEXT, INITIAL_FOLLOWUPS, WELCOME_MESSAGES } from '../config'
import {
  getThread,
  postFullResponse,
  postMessage,
  setFollowupsUtil,
  updateStatusUtil,
} from '../slack'
import { getRandomItem, getRandomItems } from '../utils'

export async function assistantThreadMessage(event: AssistantThreadStartedEvent) {
  const { channel_id, thread_ts } = event.assistant_thread

  // Post welcome message
  await postMessage(getRandomItem(WELCOME_MESSAGES), INITIAL_CONTEXT, channel_id, thread_ts)

  // Set 3 random initial followups
  await setFollowupsUtil(channel_id, thread_ts)(getRandomItems(INITIAL_FOLLOWUPS, 3))
}

export async function handleNewAssistantMessage(event: GenericMessageEvent, botUserId: string) {
  // Exclude bot messages and your own bot (TODO: is this necessary?)
  if (event.bot_id || event.bot_id === botUserId || event.bot_profile || !event.thread_ts) return

  const { thread_ts, channel } = event
  const updateStatus = updateStatusUtil(channel, thread_ts)

  const messages = await getThread(channel, thread_ts)

  const output = await generateResponse(messages, updateStatus)

  await postFullResponse(output, channel, thread_ts)
}
