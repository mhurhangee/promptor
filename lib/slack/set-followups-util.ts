import { FOLLOWUP_TITLES } from '../config'
import { getRandomItem } from '../utils'
import { client } from './client'

export async function setFollowupsUtil(
  channel: string,
  thread_ts: string,
  promptTexts: string[],
  title: string = getRandomItem(FOLLOWUP_TITLES)
) {
  if (promptTexts.length === 0) {
    return
  }

  // Create prompts array with the required format (we use the same title and message, title is what will be shown in the UI and message is what will be sent to the AI)
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
