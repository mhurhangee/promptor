/**
 * Handler for the "copy_prompt" block action
 */

import { getPromptById } from '../../db/prompts'
import { client } from '../../slack/client'
import type { SlackAction, SlackBlockAction } from '../types'
import { handlePromptLibraryAction } from './handle-prompt-library-action'

/**
 * Handle copying a prompt to clipboard
 * Note: Slack doesn't provide direct clipboard access, so we'll DM the prompt to the user
 *
 * @param payload - The Slack block action payload
 * @param action - The action data
 */
export async function handleCopyPrompt(
  payload: SlackBlockAction,
  action: SlackAction
): Promise<void> {
  await handlePromptLibraryAction(payload, async () => {
    // Get prompt ID from button value
    if (!action.value) {
      throw new Error('Prompt ID is missing')
    }
    const promptId = Number.parseInt(action.value)

    // Get prompt
    const prompt = await getPromptById(promptId)
    if (!prompt) {
      throw new Error(`Prompt with ID ${promptId} not found`)
    }

    // Send prompt content to user as DM
    await client.chat.postMessage({
      channel: payload.user.id,
      text: `Here's the prompt you requested:\n\n*${prompt.title}*\n\n\`\`\`\n${prompt.content}\n\`\`\``,
    })
  })
}
