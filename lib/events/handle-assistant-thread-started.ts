import type { AssistantThreadStartedEvent } from '@slack/web-api'
import { INITIAL_CONTEXT, INITIAL_FOLLOWUPS, WELCOME_MESSAGES } from '../config'
import { postMessage } from '../slack'
import { setFollowupsUtil } from '../slack'
import { getRandomItem, getRandomItems } from '../utils'

export async function handleAssistantThreadStarted(slackEvent: AssistantThreadStartedEvent) {
  const { channel_id, thread_ts } = slackEvent.assistant_thread

  // Post welcome message
  await postMessage(getRandomItem(WELCOME_MESSAGES), INITIAL_CONTEXT, channel_id, thread_ts)

  // Set 3 random initial followups
  await setFollowupsUtil(channel_id, thread_ts, getRandomItems(INITIAL_FOLLOWUPS, 3))
}
