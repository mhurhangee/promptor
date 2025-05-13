import type { AppHomeOpenedEvent } from '@slack/web-api'
import { homeView } from '../../config/home-view'
import { publishView } from '../slack/publish-view'

export const handleHome = async (event: AppHomeOpenedEvent) => {
  publishView(event.user, homeView)
}
