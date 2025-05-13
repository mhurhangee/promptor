import type { HomeView } from '@slack/web-api'

import { client } from './client'

export const publishView = async (userId: string, view: HomeView) => {
  try {
    await client.views.publish({
      user_id: userId,
      view,
    })
  } catch (error) {
    console.error(`Error publishing view: ${error}`)
  }
}
