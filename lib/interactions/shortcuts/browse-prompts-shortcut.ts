/**
 * Prompt Library Shortcut Handlers
 * Handles shortcuts for browsing prompts
 */

import { browsePromptsView } from '../../config/prompt-library-views'
import { getAllPrompts } from '../../db/prompt-library'
import { client } from '../../slack/client'

/**
 * Handle the "Browse Prompts" global shortcut
 * Opens a modal with the prompt library browser
 */
export const handleBrowsePromptsShortcut = async (triggerId: string) => {
  try {
    // Get all prompts from the database
    const prompts = await getAllPrompts()

    // Open the browse prompts modal
    await client.views.open({
      trigger_id: triggerId,
      view: browsePromptsView(prompts),
    })
  } catch (error) {
    console.error('Error opening prompt library from shortcut:', error)
  }
}
