import type { ModalView } from '@slack/web-api'
import { client } from './client'

/**
 * Simple utility to show a modal to a user
 * Handles error logging and provides a clean interface
 */
export const showModal = async (triggerId: string, view: ModalView): Promise<void> => {
  try {
    await client.views.open({
      trigger_id: triggerId,
      view,
    })
    console.log('Successfully opened modal')
  } catch (error) {
    console.error(`Error opening modal: ${error}`)
  }
}
