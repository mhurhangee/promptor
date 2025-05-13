import type {
  AppHomeOpenedEvent,
  AppMentionEvent,
  AssistantThreadStartedEvent,
  GenericMessageEvent,
  SlackEvent,
} from '@slack/web-api'
import { waitUntil } from '@vercel/functions'
import { handleNewAppMention } from './handle-app-mention'
import { handleHome } from './handle-home'
import { assistantThreadMessage } from './handle-messages'
import { handleNewAssistantMessage } from './handle-messages'
import { isAssistantMessage } from './is-assistant-message'

export const eventHandler = (event: SlackEvent, botUserId: string) => {
  if (event.type === 'app_home_opened') {
    waitUntil(handleHome(event as AppHomeOpenedEvent))
  }

  if (event.type === 'app_mention') {
    waitUntil(handleNewAppMention(event as AppMentionEvent, botUserId))
  }

  if (event.type === 'assistant_thread_started') {
    waitUntil(assistantThreadMessage(event as AssistantThreadStartedEvent))
  }

  // Message to assistant from user
  if (isAssistantMessage(event, botUserId)) {
    waitUntil(handleNewAssistantMessage(event as GenericMessageEvent, botUserId))
  }
}
