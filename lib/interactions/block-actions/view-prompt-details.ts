/**
 * Handler for the "view_prompt_details" block action
 */

import { promptDetailView } from '../../config/prompt-library-views'
import { getPromptById } from '../../db/prompts'
import { client } from '../../slack/client'
import type { SlackAction, SlackBlockAction } from '../types'
import { handlePromptLibraryAction } from './handle-prompt-library-action'

/**
 * Handle viewing prompt details
 *
 * @param payload - The Slack block action payload
 * @param action - The action data
 */
export async function handleViewPromptDetails(
  payload: SlackBlockAction,
  action: SlackAction
): Promise<void> {
  await handlePromptLibraryAction(payload, async () => {
    // Get prompt ID from button value
    if (!action.value) {
      throw new Error('Prompt ID is missing')
    }
    const promptId = Number.parseInt(action.value)

    // Get prompt details
    const prompt = await getPromptById(promptId)
    if (!prompt) {
      throw new Error(`Prompt with ID ${promptId} not found`)
    }

    // Add user upvote status (placeholder - would need to check DB)
    const promptWithStatus = {
      ...prompt,
      userHasUpvoted: false,
    }

    // Open prompt detail modal
    await client.views.open({
      trigger_id: payload.trigger_id,
      view: promptDetailView(promptWithStatus),
    })
  })
}
