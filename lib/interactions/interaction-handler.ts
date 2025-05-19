import { handleBlockActions, isBlockActions } from './block-actions/handler'
import { handleMessageAction, isMessageAction } from './message-actions/handler'
import { handleShortcut, isGlobalShortcut } from './shortcuts/handler'
import type { SlackInteractionPayload } from './types'
import { handleViewClosed, isViewClosed } from './view-closed/handler'
import { handleViewSubmission, isViewSubmission } from './view-submissions/handler'

/**
 * Main interaction handler for Slack interactive components
 * Dispatches to appropriate handlers based on interaction type
 */
export const interactionHandler = async (
  payload: SlackInteractionPayload
): Promise<object | undefined> => {
  // Log interaction type for debugging
  console.log(`Handling interaction type: ${payload.type}`)

  try {
    // Handle global shortcuts (triggered from search menu)
    if (isGlobalShortcut(payload)) {
      return handleShortcut(payload)
    }

    // Handle message actions (triggered from message context menus)
    if (isMessageAction(payload)) {
      return handleMessageAction(payload)
    }

    // Handle block actions (buttons, select menus, etc.)
    if (isBlockActions(payload)) {
      return handleBlockActions(payload)
    }

    // Handle view submissions (modal form submissions)
    if (isViewSubmission(payload)) {
      return await handleViewSubmission(payload)
    }

    // Handle view closed events (modal closed without submission)
    if (isViewClosed(payload)) {
      return handleViewClosed(payload)
    }

    // At this point, TypeScript has narrowed payload to 'never' type since we've handled all known types
    // We'll use a type assertion to safely log the type for debugging purposes
    const unknownPayload = payload as { type: string }
    console.warn(`Unhandled interaction type: ${unknownPayload.type || 'unknown'}`)
    return undefined
  } catch (error) {
    console.error(`Error handling interaction: ${error}`)
    return { error: 'An unexpected error occurred' }
  }
}
