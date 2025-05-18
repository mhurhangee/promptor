/**
 * Handler for the "create_prompt" block action
 */

import { createPromptView } from '../../config/prompt-library-views'
import { client } from '../../slack/client'
import type { SlackBlockAction } from '../types'
import { handlePromptLibraryAction } from './handle-prompt-library-action'

/**
 * Handle creating a new prompt
 *
 * @param payload - The Slack block action payload
 */
export async function handleCreatePrompt(payload: SlackBlockAction): Promise<void> {
  await handlePromptLibraryAction(payload, async () => {
    // Log the payload for debugging
    console.log(
      'Create prompt payload:',
      JSON.stringify(
        {
          trigger_id: payload.trigger_id,
          user: payload.user.id,
          container: payload.container,
        },
        null,
        2
      )
    )

    try {
      // Check if we're in a modal already (container.type === 'view')
      if (payload.container.type === 'view') {
        console.log(
          'Opening create prompt modal from existing modal with view_id:',
          payload.container.view_id
        )
        // When opening from an existing modal, we need to use views.push
        await client.views.push({
          trigger_id: payload.trigger_id,
          view: createPromptView,
        })
        console.log('Successfully pushed create prompt modal onto the stack')
      } else {
        // Opening from home tab or message
        console.log('Opening create prompt modal with trigger_id:', payload.trigger_id)
        await client.views.open({
          trigger_id: payload.trigger_id,
          view: createPromptView,
        })
        console.log('Successfully opened create prompt modal')
      }
    } catch (error) {
      console.error('Error opening create prompt modal:', error)
      throw error
    }
  })
}
