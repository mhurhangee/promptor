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
    // Log the action for debugging
    console.log('Toggle upvote action:', JSON.stringify(action, null, 2))
    console.log('User ID:', payload.user.id)

    // Get prompt ID from button value
    if (!action.value) {
      console.error('Prompt ID is missing in action:', action)
      throw new Error('Prompt ID is missing')
    }

    const promptId = Number.parseInt(action.value)
    console.log('Toggling upvote for prompt ID:', promptId)

    try {
      // Toggle upvote
      const upvoteAdded = await upvotePrompt(promptId, payload.user.id)
      console.log(`Upvote ${upvoteAdded ? 'added' : 'removed'} for prompt ID ${promptId}`)

      // Get updated prompt
      const updatedPrompt = await getPromptById(promptId)
      if (!updatedPrompt) {
        console.error(`Prompt with ID ${promptId} not found after upvote`)
        throw new Error(`Prompt with ID ${promptId} not found`)
      }

      console.log('Updated prompt:', {
        id: updatedPrompt.id,
        title: updatedPrompt.title,
        upvotes: updatedPrompt.upvotes,
      })

      // Add upvote status
      const promptWithStatus = {
        ...updatedPrompt,
        userHasUpvoted: upvoteAdded,
      }

      // Update the modal
      if (payload.view?.id) {
        console.log('Updating view with ID:', payload.view.id)
        await client.views.update({
          view_id: payload.view.id,
          view: promptDetailView(promptWithStatus),
        })
        console.log('Successfully updated view with new upvote status')
      } else {
        console.log('No view ID found in payload, skipping view update')
      }
    } catch (error) {
      console.error('Error in toggle upvote handler:', error)
      throw error
    }
  })
}
