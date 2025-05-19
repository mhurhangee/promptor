import type { ModalView } from '@slack/web-api'
import { client } from './client'

/**
 * Pushes a modal view on top of an existing modal
 * Used when a user interacts with a button in an existing modal
 */
export const pushModal = async (triggerId: string, view: ModalView): Promise<void> => {
  try {
    await client.views.push({
      trigger_id: triggerId,
      view,
    })
  } catch (error) {
    console.error(`Error pushing modal: ${error}`)
  }
}
