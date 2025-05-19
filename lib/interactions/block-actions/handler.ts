import { examplePrompts } from '../../config'
import { createPromptModal, promptLibraryModal } from '../../config/views'
import { showModal } from '../../slack'
import { client } from '../../slack/client'
import type { Action, BlockActionsPayload, SlackInteractionPayload } from '../types'

/**
 * Type guard for block actions
 */
export function isBlockActions(payload: SlackInteractionPayload): payload is BlockActionsPayload {
  return payload.type === 'block_actions'
}

/**
 * Handle block actions (buttons, select menus, etc.)
 */
export const handleBlockActions = (payload: BlockActionsPayload): object | undefined => {
  const { trigger_id, user, actions } = payload

  // Check if we have actions to process
  if (!actions || actions.length === 0) {
    console.error('No actions found in block actions payload')
    return undefined
  }

  // Check if trigger_id is available
  if (!trigger_id) {
    console.error('No trigger_id available for block action')
    return undefined
  }

  // Process each action
  for (const action of actions) {
    const { action_id } = action
    console.log(`Processing block action: ${action_id}`)

    // Get container information to determine if we're in a modal
    const container = payload.container || { type: 'unknown' }
    console.log(`Action container type: ${container.type}`)

    // Handle different block actions based on action_id
    if (action_id === 'create_prompt_button' || action_id === 'home_create_prompt_button') {
      return handleCreatePromptButton(trigger_id, container)
    }

    if (action_id === 'home_view_library_button') {
      return handleViewLibraryButton(trigger_id)
    }

    if (action_id.startsWith('use_prompt_')) {
      // Make sure user.id is available
      if (!user || !user.id) {
        console.error('User ID not available for use prompt action')
        return undefined
      }
      return handleUsePromptButton(action, user.id)
    }

    // Log unhandled action
    console.log(`Unhandled block action: ${action_id}`)
  }

  // Return undefined as we don't need to send a response to Slack
  return undefined
}

/**
 * Handle the create prompt button click
 * Opens the create prompt modal
 * @param triggerId The trigger ID for the interaction
 * @param container The container information for the interaction
 */
const handleCreatePromptButton = (
  triggerId: string,
  container: BlockActionsPayload['container']
): undefined => {
  console.log(`Opening create prompt modal from button click with trigger_id: ${triggerId}`)

  // Use our unified modal utility which automatically handles
  // the appropriate method (open or push) based on the context
  showModal(triggerId, createPromptModal)

  return undefined
}

/**
 * Handle the view prompt library button click
 * Opens the prompt library modal
 */
const handleViewLibraryButton = (triggerId: string): undefined => {
  console.log(`Opening prompt library modal with trigger_id: ${triggerId}`)

  // In a real implementation, you would fetch prompts from a database
  // For this example, we use the centralized example data

  // Open the prompt library modal with the example prompts
  showModal(triggerId, promptLibraryModal(examplePrompts))

  return undefined
}

/**
 * Handle the use prompt button click
 * This sends the prompt to the user's DM channel
 */
const handleUsePromptButton = async (action: Action, userId: string): Promise<undefined> => {
  try {
    // Extract the prompt ID from the action_id (format: use_prompt_<id>)
    const promptId = action.action_id.replace('use_prompt_', '')
    const promptValue = action.value

    console.log(`User ${userId} wants to use prompt ${promptId} with value ${promptValue}`)

    // In a real implementation, you would fetch the prompt from a database
    // For this example, we'll use a mock prompt based on the ID
    const mockPromptText = `This is the content of prompt ${promptId}. In a real implementation, this would be fetched from a database.`

    // First, open a DM with the user
    const conversationResponse = await client.conversations.open({
      users: userId,
    })

    if (!conversationResponse.ok || !conversationResponse.channel?.id) {
      throw new Error('Failed to open DM channel')
    }

    // Then send the prompt to the DM channel
    const messageResponse = await client.chat.postMessage({
      channel: conversationResponse.channel.id,
      text: mockPromptText,
      mrkdwn: true,
    })

    if (messageResponse.ok) {
      console.log(`Successfully sent prompt ${promptId} to user ${userId}`)
    } else {
      throw new Error(`Failed to send message: ${JSON.stringify(messageResponse)}`)
    }
  } catch (error) {
    console.error(`Error in handleUsePromptButton: ${error}`)
  }

  return undefined
}
