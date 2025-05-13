import { homeView } from '@/lib/config'
import { publishView } from '@/lib/slack'
import type { AppHomeOpenedEvent } from '@slack/web-api'

// Handle home tab
export const handleHome = async (event: AppHomeOpenedEvent) => {
  // Publish home view
  publishView(event.user, homeView)
}
