import type { SlackEvent } from '@slack/web-api'

// Adapted from isAssistantMessage in https://github.com/slackapi/bolt-js/blob/main/src/Assistant.ts
export function isAssistantMessage(event: SlackEvent): boolean {
  const isThreadMessage = 'channel' in event && 'thread_ts' in event
  const inAssistantContainer =
    'channel_type' in event &&
    event.channel_type === 'im' &&
    (!('subtype' in event) || event.subtype === 'file_share' || event.subtype === undefined)

  // Exclude bot messages and your own bot
  const notFromBot = !('bot_id' in event) && !('bot_profile' in event) && 'user' in event

  return event.type === 'message' && isThreadMessage && inAssistantContainer && notFromBot
}
