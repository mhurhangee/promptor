// DISABLED for as I don't think it is relevant to Promptor use case

import type { AppMentionEvent } from '@slack/web-api'
import { generateResponse } from '../ai'
import { THINKING_MESSAGES } from '../config'
import { getThread, updateMessageUtil } from '../slack'
import { getRandomItem } from '../utils'

export async function handleNewAppMention(event: AppMentionEvent, botUserId: string) {
  // Exclude bot messages and your own bot (TODO: should this be done in the event handler?)
  if (event.bot_id || event.bot_id === botUserId || event.bot_profile) {
    return
  }

  // Get thread and post thinking message
  const { thread_ts, channel } = event
  const updateMessage = await updateMessageUtil(getRandomItem(THINKING_MESSAGES), event)

  // If thread exists, get thread and generate response
  if (thread_ts) {
    const messages = await getThread(channel, thread_ts) // Used to include botUserId
    const result = await generateResponse(messages, updateMessage)
    await updateMessage(result)
    // If no thread exists, create a new thread and generate response
  } else {
    const result = await generateResponse([{ role: 'user', content: event.text }], updateMessage)
    await updateMessage(result)
  }
}
