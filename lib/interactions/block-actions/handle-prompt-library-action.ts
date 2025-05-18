/**
 * Utility function for handling prompt library actions with error handling
 */

import { client } from '../../slack/client'
import type { SlackBlockAction } from '../types'

/**
 * Helper function to handle prompt library actions with error handling
 *
 * @param payload - The Slack block action payload
 * @param handler - The handler function to execute
 */
export async function handlePromptLibraryAction(
  payload: SlackBlockAction,
  handler: () => Promise<void>
): Promise<void> {
  try {
    await handler()
  } catch (error) {
    console.error('Error handling prompt library action:', error)

    // Send error message to user if possible
    try {
      await client.chat.postMessage({
        channel: payload.user.id,
        text: 'Sorry, there was an error processing your request. Please try again later.',
      })
    } catch (dmError) {
      console.error('Error sending error message:', dmError)
    }
  }
}
