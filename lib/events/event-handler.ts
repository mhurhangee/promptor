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

export const eventHandler = async (slackEvent: SlackEvent): Promise<void> => {
  try {
    // Handle app home opened
    if (slackEvent.type === 'app_home_opened') {
      // We can directly await this since we need the home view to load quickly
      await handleHome(slackEvent as AppHomeOpenedEvent)
    }

    // For other event types, we can use waitUntil to handle them asynchronously
    // since they don't need to block the response

    // Handle assistant thread started
    if (slackEvent.type === 'assistant_thread_started') {
      waitUntil(handleAssistantThreadStarted(slackEvent as AssistantThreadStartedEvent))
    }

    // Handle new assistant message
    if (isAssistantMessage(slackEvent)) {
      waitUntil(handleNewAssistantMessage(slackEvent as GenericMessageEvent))
    }
  } catch (error) {
    console.error(`Error handling event: ${error}`)
  }
}
