/**
 * Block Action Handler
 * Routes block actions to the appropriate handler based on action_id
 */

import {
  handleCopyPrompt,
  handleCreatePrompt,
  handleOpenPromptLibrary,
  handleSearchPrompts,
  handleToggleUpvote,
  handleViewPromptDetails,
} from './block-actions'
import type { SlackAction, SlackBlockAction } from './types'

/**
 * Routes block action interactions to the appropriate handler
 *
 * @param payload - The Slack block action payload
 * @returns Response object or null
 */
export const blockActionHandler = (payload: SlackBlockAction): Promise<void> | null => {
  // Extract action from payload
  const action: SlackAction = payload.actions[0]
  const actionId: string = action.action_id

  // Route to the appropriate handler based on action_id
  switch (actionId) {
    case 'open_prompt_library':
      return handleOpenPromptLibrary(payload)

    case 'create_prompt':
      return handleCreatePrompt(payload)

    case 'view_prompt_details':
      return handleViewPromptDetails(payload, action)

    case 'toggle_upvote':
      return handleToggleUpvote(payload, action)

    case 'search_prompts':
      return handleSearchPrompts(payload)

    case 'copy_prompt':
      return handleCopyPrompt(payload, action)

    default:
      console.warn(`Unknown block action: ${actionId}`)
      return null
  }
}
