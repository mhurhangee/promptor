/**
 * Block Action Handler
 * Routes block actions to the appropriate handler based on action_id
 */

import { waitUntil } from '@vercel/functions'
import {
  handleCopyPrompt,
  handleCreatePrompt,
  handleOpenPromptLibrary,
  handleViewPromptDetails,
} from '.'
import type { SlackAction, SlackBlockAction } from '../types'

/**
 * Routes block action interactions to the appropriate handler
 *
 * @param payload - The Slack block action payload
 * @returns Response object or null
 */
export const blockActionHandler = (payload: SlackBlockAction): void => {
  // Extract action from payload
  const action: SlackAction = payload.actions[0]
  const actionId: string = action.action_id

  // Route to the appropriate handler based on action_id
  switch (actionId) {
    case 'open_prompt_library':
      waitUntil(handleOpenPromptLibrary(payload))
      break

    case 'create_prompt':
      waitUntil(handleCreatePrompt(payload))
      break

    case 'view_prompt_details':
      waitUntil(handleViewPromptDetails(payload, action))
      break

    case 'copy_prompt':
      waitUntil(handleCopyPrompt(payload, action))
      break

    default:
      console.warn(`Unknown block action: ${actionId}`)
    // No action needed for unknown actions
  }
}
