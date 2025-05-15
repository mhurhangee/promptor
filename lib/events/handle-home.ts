import type { AppHomeOpenedEvent } from '@slack/web-api'
import { homeView } from '../config'
import { publishView } from '../slack'

export const handleHome = async (slackEvent: AppHomeOpenedEvent) => {
  publishView(slackEvent.user, homeView)
}
