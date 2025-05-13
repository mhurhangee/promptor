import { generateResponse } from '@/lib/ai'
import { THINKING_MESSAGES } from '@/lib/config'
import { getThread, updateMessageUtil } from '@/lib/slack'
import { getRandomItem } from '@/lib/utils'
import type { AppMentionEvent } from '@slack/web-api'

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
    const messages = await getThread(channel, thread_ts, botUserId)
    const result = await generateResponse(messages, updateMessage)
    await updateMessage(result)
    // If no thread exists, create a new thread and generate response
  } else {
    const result = await generateResponse([{ role: 'user', content: event.text }], updateMessage)
    await updateMessage(result)
  }
}
