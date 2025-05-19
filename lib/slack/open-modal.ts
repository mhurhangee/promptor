import type { ModalView } from '@slack/web-api'
import { client } from './client'

/**
 * Opens a modal view for a user
 * Used for shortcuts and block actions
 */
export const openModal = async (triggerId: string, view: ModalView): Promise<void> => {
  try {
    await client.views.open({
      trigger_id: triggerId,
      view,
    })
  } catch (error) {
    console.error(`Error opening modal: ${error}`)
  }
}
