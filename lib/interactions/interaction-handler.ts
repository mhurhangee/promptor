import type { SlackViewResponse } from './submissions/view-submission-handler'
import type { SlackBlockAction, SlackShortcut, SlackViewSubmission } from './types'

import { blockActionHandler } from './block-actions/block-action-handler'
import { shortcutHandler } from './shortcuts/shortcut-handler'
import { viewSubmissionHandler } from './submissions/view-submission-handler'

/**
 * Handles all types of Slack interactions
 *
 * @param payload - The Slack interaction payload
 * @returns Promise that resolves when processing is complete, or returns a response for view submissions
 */
export const interactionHandler = async (
  payload: SlackShortcut | SlackViewSubmission | SlackBlockAction
): Promise<SlackViewResponse | null | undefined> => {
  try {
    // Handle shortcuts (global or message actions)
    if (payload.type === 'shortcut' || payload.type === 'message_action') {
      shortcutHandler(payload)
      return
    }

    // Handle view submissions
    if (payload.type === 'view_submission') {
      // View submissions need to return a response to Slack
      const response = await viewSubmissionHandler(payload)
      // Return the response to the API endpoint
      return response
    }

    // Handle block actions
    if (payload.type === 'block_actions') {
      // Use the block action handler to route the action
      blockActionHandler(payload)
      return
    }

    // Unhandled interaction type
    console.warn(`Unhandled interaction type: ${payload.type}`)
  } catch (error) {
    console.error('Error handling interaction:', error)
    throw error
  }
}
