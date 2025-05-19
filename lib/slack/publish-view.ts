import { getHomeView } from '../config/views/get-home-view'
import { client } from './client'

/**
 * Publish the home view to a user
 * Fetches the latest prompts from the database
 */
export const publishView = async (userId: string) => {
  try {
    // Get the dynamic home view with real prompts from the database
    const view = await getHomeView()

    // Publish the view to the user
    await client.views.publish({
      user_id: userId,
      view,
    })
  } catch (error) {
    console.error(`Error publishing view: ${error}`)
  }
}
