/**
 * Handler for the "open_prompt_library" block action
 */

import { browsePromptsView } from '../../config/prompt-library-views'
import { getAllPrompts } from '../../db/prompts'
import { client } from '../../slack/client'
import type { SlackBlockAction } from '../types'
import { handlePromptLibraryAction } from './handle-prompt-library-action'

/**
 * Handle opening the prompt library from home tab
 *
 * @param payload - The Slack block action payload
 */
export async function handleOpenPromptLibrary(payload: SlackBlockAction): Promise<void> {
  await handlePromptLibraryAction(payload, async () => {
    // Log the payload for debugging
    console.log(
      'Open prompt library payload:',
      JSON.stringify(
        {
          trigger_id: payload.trigger_id,
          user: payload.user.id,
        },
        null,
        2
      )
    )

    try {
      // Get all prompts from the database
      console.log('Fetching all prompts from database')
      const prompts = await getAllPrompts()
      console.log(`Found ${prompts.length} prompts`)

      // Open the browse prompts modal
      console.log('Opening browse prompts modal with trigger_id:', payload.trigger_id)
      await client.views.open({
        trigger_id: payload.trigger_id,
        view: browsePromptsView(prompts),
      })
      console.log('Successfully opened browse prompts modal')
    } catch (error) {
      console.error('Error opening prompt library:', error)
      throw error
    }
  })
}
