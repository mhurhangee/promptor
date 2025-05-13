import { followupTitles } from '@/lib/config'
import { client } from '@/lib/slack'
import { getRandomItem } from '@/lib/utils'

export const setFollowupsUtil = (channel: string, thread_ts: string) => {
  return async (promptTexts: string[], title: string = getRandomItem(followupTitles)) => {
    if (promptTexts.length === 0) {
      return
    }

    // Create prompts array with the required format
    const prompts = promptTexts.map((text) => ({
      title: text,
      message: text,
    }))

    // Ensure we have at least one prompt (required by Slack API)
    await client.assistant.threads.setSuggestedPrompts({
      channel_id: channel,
      thread_ts: thread_ts,
      title,
      prompts: [prompts[0], ...prompts.slice(1)], // This ensures the type is correct
    })
  }
}
