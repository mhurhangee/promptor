import type { AppHomeOpenedEvent } from '@slack/web-api'
import { publishView } from '../slack'

/**
 * Handle the app_home_opened event
 * Publishes the home view with prompts from the database
 */
export const handleHome = async (slackEvent: AppHomeOpenedEvent): Promise<void> => {
  try {
    // The publishView function now fetches prompts from the database
    await publishView(slackEvent.user)
  } catch (error) {
    console.error(`Error handling home event: ${error}`)
  }
}
