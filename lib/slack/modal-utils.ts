import type { ModalView } from '@slack/web-api'
import { client } from './client'

/**
 * Unified modal handling utility
 * Handles both opening new modals and pushing modals onto existing stacks
 * Automatically determines the appropriate method based on the context
 */
export const showModal = async (
  triggerId: string,
  view: ModalView,
  options: { forceMethod?: 'open' | 'push' | 'update' } = {}
): Promise<void> => {
  try {
    const { forceMethod } = options

    // If a specific method is requested, use that
    if (forceMethod) {
      await useSpecificMethod(forceMethod, triggerId, view)
      return
    }

    // Otherwise, try to open the modal first (most common case)
    try {
      await client.views.open({
        trigger_id: triggerId,
        view,
      })
      console.log('Successfully opened modal')
    } catch (error) {
      // If opening fails, try pushing (for when inside an existing modal)
      console.log(`Error opening modal: ${error}, trying push instead`)
      try {
        await client.views.push({
          trigger_id: triggerId,
          view,
        })
        console.log('Successfully pushed modal')
      } catch (pushError) {
        console.error(`Error pushing modal: ${pushError}`)
        throw pushError
      }
    }
  } catch (error) {
    console.error(`Error showing modal: ${error}`)
  }
}

/**
 * Use a specific method to show a modal
 */
const useSpecificMethod = async (
  method: 'open' | 'push' | 'update',
  triggerId: string,
  view: ModalView
): Promise<void> => {
  try {
    switch (method) {
      case 'open':
        await client.views.open({
          trigger_id: triggerId,
          view,
        })
        console.log('Successfully opened modal with forced method')
        break
      case 'push':
        await client.views.push({
          trigger_id: triggerId,
          view,
        })
        console.log('Successfully pushed modal with forced method')
        break
      case 'update':
        // For update, we need to extract the view_id from the view object
        // and then remove it from the view object before sending it to the API
        if ('view_id' in view && typeof view.view_id === 'string') {
          const viewId = view.view_id
          const { view_id, ...viewWithoutId } = view as ModalView & { view_id: string }
          await client.views.update({
            view_id: viewId,
            view: viewWithoutId as ModalView,
          })
          console.log('Successfully updated modal with forced method')
        } else {
          throw new Error('Cannot update view without view_id')
        }
        break
      default:
        throw new Error(`Unknown method: ${method}`)
    }
  } catch (error) {
    console.error(`Error using specific method ${method}: ${error}`)
    throw error
  }
}
