import type { AppHomeOpenedEvent } from '@slack/web-api'
import { homeView } from '../config'
import { publishView } from '../slack'

// Handle home tab
export const handleHome = async (event: AppHomeOpenedEvent) => {
  // Publish home view
  publishView(event.user, homeView)
}
