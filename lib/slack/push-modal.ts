import type { ModalView } from '@slack/web-api'
import { client } from './client'

/**
 * Pushes a modal view on top of an existing modal
 * Used when a user interacts with a button in an existing modal
 *
 * Note: When pushing views, the view being pushed must have the same type
 * as the root view in the existing modal stack.
 */
export const pushModal = async (triggerId: string, view: ModalView): Promise<void> => {
  try {
    // Ensure the view type is 'modal' which is required for views.push
    const viewWithCorrectType: ModalView = {
      ...view,
      type: 'modal' as const,
    }

    await client.views.push({
      trigger_id: triggerId,
      view: viewWithCorrectType,
    })
  } catch (error) {
    console.error(`Error pushing modal: ${error}`)
    // Fall back to opening a new modal if pushing fails
    try {
      console.log('Falling back to opening a new modal')
      await client.views.open({
        trigger_id: triggerId,
        view,
      })
    } catch (fallbackError) {
      console.error(`Fallback also failed: ${fallbackError}`)
    }
  }
}
