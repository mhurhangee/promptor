import type { SlackEvent } from '@slack/web-api'

export function isAssistantMessage(event: SlackEvent): boolean {
  const isMessage = event.type === 'message'
  const isThreadMessage = 'channel' in event && 'thread_ts' in event
  const inAssistantContainer = 'channel_type' in event && event.channel_type === 'im'
  const notFromBot = !('bot_id' in event) && !('bot_profile' in event) && 'user' in event

  return isMessage && isThreadMessage && inAssistantContainer && notFromBot
}
