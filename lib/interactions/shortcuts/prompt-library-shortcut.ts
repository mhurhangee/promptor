/**
 * Prompt Library Shortcut Handlers
 * Handles shortcuts for browsing and creating prompts
 */

import { browsePromptsView, createPromptView } from '../../config/prompt-library-views'
import { getAllPrompts } from '../../db/prompts'
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

/**
 * Handle the "Create Prompt" global shortcut
 * Opens a modal for creating a new prompt
 */
export const handleCreatePromptShortcut = async (triggerId: string) => {
  try {
    // Open the create prompt modal
    await client.views.open({
      trigger_id: triggerId,
      view: createPromptView,
    })
  } catch (error) {
    console.error('Error opening create prompt modal from shortcut:', error)
  }
}
