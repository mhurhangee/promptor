/**
 * Handler for the "view_prompt_details" block action
 */

import { promptDetailView } from '../../config/prompt-library-views'
import { getPromptById } from '../../db/prompt-library'
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
    // Log the action for debugging
    console.log('View prompt details action:', JSON.stringify(action, null, 2))
    console.log('Payload trigger_id:', payload.trigger_id)
    console.log('Container type:', payload.container.type)

    // Get prompt ID from button value
    if (!action.value) {
      console.error('Prompt ID is missing in action:', action)
      throw new Error('Prompt ID is missing')
    }

    const promptId = Number.parseInt(action.value)
    console.log('Looking up prompt with ID:', promptId)

    try {
      // Get prompt details
      const prompt = await getPromptById(promptId)
      if (!prompt) {
        console.error(`Prompt with ID ${promptId} not found`)
        throw new Error(`Prompt with ID ${promptId} not found`)
      }

      console.log('Found prompt:', prompt.title)

      // Add user upvote status (placeholder - would need to check DB)
      const promptWithStatus = {
        ...prompt,
        userHasUpvoted: false,
      }

      // Check if we're in a modal already (container.type === 'view')
      if (payload.container.type === 'view') {
        console.log(
          'Opening prompt detail modal from existing modal with view_id:',
          payload.container.view_id
        )
        // When opening from an existing modal, we need to use views.push
        await client.views.push({
          trigger_id: payload.trigger_id,
          view: promptDetailView(promptWithStatus),
        })
        console.log('Successfully pushed prompt detail modal onto the stack')
      } else {
        // Opening from home tab or message
        console.log('Opening prompt detail modal with trigger_id:', payload.trigger_id)
        await client.views.open({
          trigger_id: payload.trigger_id,
          view: promptDetailView(promptWithStatus),
        })
        console.log('Successfully opened prompt detail modal')
      }
    } catch (error) {
      console.error('Error in view prompt details handler:', error)
      throw error
    }
  })
}
