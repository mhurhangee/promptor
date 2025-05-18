import type { SlackBlockAction, SlackShortcut, SlackViewSubmission } from './types'

import { blockActionHandler } from './block-actions/block-action-handler'
import { shortcutHandler } from './shortcuts/shortcut-handler'
import { viewSubmissionHandler } from './submissions/view-submission-handler'

export const interactionHandler = async (
  payload: SlackShortcut | SlackViewSubmission | SlackBlockAction
) => {
  try {
    // Handle shortcuts (global or message actions)
    if (payload.type === 'shortcut' || payload.type === 'message_action') {
      shortcutHandler(payload)
      return new Response('OK', { status: 200 })
    }

    // Handle view submissions
    if (payload.type === 'view_submission') {
      const response = await viewSubmissionHandler(payload)

      if (response) {
        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Default empty response if no specific handler response
      return new Response('', { status: 200 })
    }

    // Handle block actions
    if (payload.type === 'block_actions') {
      // Use the block action handler to route the action
      blockActionHandler(payload)
      return new Response('OK', { status: 200 })
    }

    // Unhandled interaction type
    console.warn(`Unhandled interaction type: ${payload.type}`)
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error handling interaction:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
