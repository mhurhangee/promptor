import type { GenericMessageEvent, SlackEvent } from '@slack/web-api'
import { waitUntil } from '@vercel/functions'
import { handleNewAppMention } from './handle-app-mention'
import { assistantThreadMessage } from './handle-messages'
import { handleNewAssistantMessage } from './handle-messages'
import { isAssistantMessage } from './is-assistant-message'

export const eventHandler = (event: SlackEvent, botUserId: string) => {
  if (event.type === 'app_mention') {
    waitUntil(handleNewAppMention(event, botUserId))
  }

  if (event.type === 'assistant_thread_started') {
    waitUntil(assistantThreadMessage(event))
  }

  if (isAssistantMessage(event, botUserId)) {
    waitUntil(handleNewAssistantMessage(event as GenericMessageEvent, botUserId))
  }
}
