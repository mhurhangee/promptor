import type { SlackEvent } from '@slack/web-api'

export function isAssistantMessage(event: SlackEvent, botUserId: string): boolean {
  const isThreadMessage = 'channel' in event && 'thread_ts' in event
  const inAssistantContainer =
    'channel_type' in event &&
    event.channel_type === 'im' &&
    (!('subtype' in event) || event.subtype === 'file_share' || event.subtype === undefined)

  // Exclude bot messages and your own bot
  const notFromBot =
    !('bot_id' in event) &&
    !('bot_profile' in event) &&
    ('user' in event ? event.user !== botUserId : true)

  return event.type === 'message' && isThreadMessage && inAssistantContainer && notFromBot
}
