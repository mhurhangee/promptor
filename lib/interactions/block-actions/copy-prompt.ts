/**
 * Handler for the "copy_prompt" block action
 */

import { getPromptById } from '../../db/prompt-library'
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
    // Log the action for debugging
    console.log('Copy prompt action:', JSON.stringify(action, null, 2))
    console.log('User ID:', payload.user.id)

    // Get prompt ID from button value
    if (!action.value) {
      console.error('Prompt ID is missing in action:', action)
      throw new Error('Prompt ID is missing')
    }

    const promptId = Number.parseInt(action.value)
    console.log('Copying prompt with ID:', promptId)

    try {
      // Get prompt
      const prompt = await getPromptById(promptId)
      if (!prompt) {
        console.error(`Prompt with ID ${promptId} not found`)
        throw new Error(`Prompt with ID ${promptId} not found`)
      }

      console.log('Found prompt to copy:', {
        id: prompt.id,
        title: prompt.title,
      })

      // Send prompt content to user as DM
      console.log('Sending prompt content to user as DM')
      await client.chat.postMessage({
        channel: payload.user.id,
        text: `Here's the prompt you requested:\n\n*${prompt.title}*\n\n\`\`\`\n${prompt.content}\n\`\`\``,
      })
      console.log('Successfully sent prompt content to user')
    } catch (error) {
      console.error('Error in copy prompt handler:', error)
      throw error
    }
  })
}
