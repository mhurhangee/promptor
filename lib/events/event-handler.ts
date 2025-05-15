import type {
  AppHomeOpenedEvent,
  AssistantThreadStartedEvent,
  GenericMessageEvent,
  SlackEvent,
} from '@slack/web-api'
import { waitUntil } from '@vercel/functions'
import {
  handleAssistantThreadStarted,
  handleHome,
  handleNewAssistantMessage,
  isAssistantMessage,
} from '../events'

// Handle events
export const eventHandler = (event: SlackEvent) => {
  // Handle home tab
  if (event.type === 'app_home_opened') {
    waitUntil(handleHome(event as AppHomeOpenedEvent))
  }

  // Handle new assistant thread
  if (event.type === 'assistant_thread_started') {
    waitUntil(handleAssistantThreadStarted(event as AssistantThreadStartedEvent))
  }

  // Handle message to assistant from user
  if (isAssistantMessage(event)) {
    waitUntil(handleNewAssistantMessage(event as GenericMessageEvent))
  }
}
