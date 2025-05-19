import type { SlackViewResponse } from './submissions/view-submission-handler'
import type { SlackBlockAction, SlackShortcut, SlackViewSubmission } from './types'

import {
  getActionIdFromPayload,
  getModalIdFromAction,
  isModalAction,
  modals,
} from '../slack/modals'
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
    // Handle view submissions
    if (payload.type === 'view_submission') {
      // First try to handle with the modal registry
      const modalResponse = await modals.handleSubmission(payload)
      if (modalResponse) {
        return modalResponse
      }

      // Fall back to the legacy view submission handler if needed
      return await viewSubmissionHandler(payload)
    }

    // Check for modal actions in block actions
    if (payload.type === 'block_actions') {
      const actionId = getActionIdFromPayload(payload)

      if (actionId && isModalAction(actionId)) {
        // Extract the modal ID from the action ID
        const modalId = getModalIdFromAction(actionId)

        // Open the modal using the registry
        await modals.openModal(modalId, payload)
        return null
      }

      // Otherwise use the regular block action handler
      await blockActionHandler(payload)
      return null
    }

    // Handle shortcuts (global or message actions)
    if (payload.type === 'shortcut' || payload.type === 'message_action') {
      // Check if this is a modal shortcut (convention: shortcut ID starts with "modal:")
      if (payload.callback_id.startsWith('modal:')) {
        const modalId = payload.callback_id.replace('modal:', '')
        await modals.openModal(modalId, payload)
        return null
      }

      // Otherwise use the regular shortcut handler
      await shortcutHandler(payload)
      return null
    }

    // Unhandled interaction type
    console.warn(`Unhandled interaction type: ${payload.type}`)
    return null
  } catch (error) {
    console.error('Error handling interaction:', error)
    throw error
  }
}
