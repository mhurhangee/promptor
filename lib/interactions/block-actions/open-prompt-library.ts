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
    // Get all prompts
    const prompts = await getAllPrompts()

    // Open browse prompts modal
    await client.views.open({
      trigger_id: payload.trigger_id,
      view: browsePromptsView(prompts),
    })
  })
}
