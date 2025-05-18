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
  handlePromptCommand,
  isAssistantMessage,
} from '../events'

export const eventHandler = (slackEvent: SlackEvent) => {
  // Handle app home opened
  if (slackEvent.type === 'app_home_opened') {
    waitUntil(handleHome(slackEvent as AppHomeOpenedEvent))
  }

  // Handle assistant thread started
  if (slackEvent.type === 'assistant_thread_started') {
    waitUntil(handleAssistantThreadStarted(slackEvent as AssistantThreadStartedEvent))
  }

  // Handle new assistant message
  if (isAssistantMessage(slackEvent)) {
    const messageEvent = slackEvent as GenericMessageEvent;
    
    // Check if it's a prompt command
    if (messageEvent.text?.startsWith('/prompts')) {
      waitUntil(handlePromptCommand(messageEvent));
    } else {
      waitUntil(handleNewAssistantMessage(messageEvent));
    }
  }
}
