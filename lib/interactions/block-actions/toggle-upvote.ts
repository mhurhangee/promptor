/**
 * Handler for the "toggle_upvote" block action
 */

import { promptDetailView } from '../../config/prompt-library-views'
import { getPromptById, upvotePrompt } from '../../db/prompts'
import { client } from '../../slack/client'
import type { SlackAction, SlackBlockAction } from '../types'
import { handlePromptLibraryAction } from './handle-prompt-library-action'

/**
 * Handle toggling upvote on a prompt
 *
 * @param payload - The Slack block action payload
 * @param action - The action data
 */
export async function handleToggleUpvote(
  payload: SlackBlockAction,
  action: SlackAction
): Promise<void> {
  await handlePromptLibraryAction(payload, async () => {
    // Get prompt ID from button value
    if (!action.value) {
      throw new Error('Prompt ID is missing')
    }
    const promptId = Number.parseInt(action.value)

    // Toggle upvote
    const upvoteAdded = await upvotePrompt(promptId, payload.user.id)

    // Get updated prompt
    const updatedPrompt = await getPromptById(promptId)
    if (!updatedPrompt) {
      throw new Error(`Prompt with ID ${promptId} not found`)
    }

    // Add upvote status
    const promptWithStatus = {
      ...updatedPrompt,
      userHasUpvoted: upvoteAdded,
    }

    // Update the modal
    if (payload.view?.id) {
      await client.views.update({
        view_id: payload.view.id,
        view: promptDetailView(promptWithStatus),
      })
    }
  })
}
