/**
 * Prompt Library Shortcut Handlers
 * Handles shortcuts for creating prompts
 */

import { createPromptView } from '../../config/prompt-library-views'
import { client } from '../../slack/client'

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
