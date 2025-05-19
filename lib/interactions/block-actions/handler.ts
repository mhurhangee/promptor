import { createPromptModal, getEditPromptModal } from '../../config/views'
import { deletePrompt, getPromptById } from '../../db'
import { publishView, showModal } from '../../slack'
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

    // Handle different block actions based on action_id
    if (action_id === 'create_prompt_button' || action_id === 'home_create_prompt_button') {
      return handleCreatePromptButton(trigger_id)
    }

    if (action_id.startsWith('use_prompt_')) {
      // Make sure user.id is available
      if (!user || !user.id) {
        console.error('User ID not available for use prompt action')
        return undefined
      }
      return handleUsePromptButton(action, user.id)
    }

    if (action_id.startsWith('edit_prompt_')) {
      // Make sure trigger_id is available for opening the modal
      if (!trigger_id) {
        console.error('No trigger_id available for edit prompt action')
        return undefined
      }
      return handleEditPromptButton(action, trigger_id)
    }

    if (action_id.startsWith('delete_prompt_')) {
      // Make sure user.id is available
      if (!user || !user.id) {
        console.error('User ID not available for delete prompt action')
        return undefined
      }
      return handleDeletePromptButton(action, user.id)
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
 */
const handleCreatePromptButton = (triggerId: string): undefined => {
  // Open the create prompt modal
  showModal(triggerId, createPromptModal)

  return undefined
}

/**
 * Handle the use prompt button click
 * This sends the prompt to the user's DM channel
 */
const handleUsePromptButton = async (action: Action, userId: string): Promise<undefined> => {
  try {
    // Extract the prompt ID from the action_id (format: use_prompt_<id>)
    const promptId = Number.parseInt(action.action_id.replace('use_prompt_', ''), 10)

    if (Number.isNaN(promptId)) {
      throw new Error(`Invalid prompt ID: ${action.action_id}`)
    }

    console.log(`User ${userId} wants to use prompt ${promptId}`)

    // Fetch the prompt from the database
    const prompt = await getPromptById(promptId)

    if (!prompt) {
      throw new Error(`Prompt not found with ID: ${promptId}`)
    }

    // First, open a DM with the user
    const conversationResponse = await client.conversations.open({
      users: userId,
    })

    if (!conversationResponse.ok || !conversationResponse.channel?.id) {
      throw new Error('Failed to open DM channel')
    }

    // Format the message with the prompt content
    const message = `*${prompt.title}*\n\n${prompt.content}`

    // Send the prompt to the DM channel
    const messageResponse = await client.chat.postMessage({
      channel: conversationResponse.channel.id,
      text: message,
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

/**
 * Handle the delete prompt button click
 * Deletes the prompt from the database and refreshes the home view
 */
const handleDeletePromptButton = async (action: Action, userId: string): Promise<undefined> => {
  try {
    // Extract the prompt ID from the action_id (format: delete_prompt_<id>)
    const promptId = Number.parseInt(action.action_id.replace('delete_prompt_', ''), 10)

    if (Number.isNaN(promptId)) {
      throw new Error(`Invalid prompt ID: ${action.action_id}`)
    }

    console.log(`User ${userId} is deleting prompt ${promptId}`)

    // Delete the prompt from the database
    await deletePrompt(promptId)

    // Refresh the home view to reflect the deletion
    await publishView(userId)

    return undefined
  } catch (error) {
    console.error(`Error deleting prompt: ${error}`)
    return undefined
  }
}

/**
 * Handle the edit prompt button click
 * Opens the edit prompt modal with the existing prompt data
 */
const handleEditPromptButton = async (action: Action, triggerId: string): Promise<undefined> => {
  try {
    // Extract the prompt ID from the action_id (format: edit_prompt_<id>)
    const promptId = Number.parseInt(action.action_id.replace('edit_prompt_', ''), 10)

    if (Number.isNaN(promptId)) {
      throw new Error(`Invalid prompt ID: ${action.action_id}`)
    }

    console.log(`Opening edit modal for prompt ${promptId}`)

    // Fetch the prompt from the database
    const prompt = await getPromptById(promptId)

    if (!prompt) {
      throw new Error(`Prompt not found with ID: ${promptId}`)
    }

    // Create the edit modal with the existing prompt data
    const editModal = getEditPromptModal(prompt)

    // Open the edit modal
    showModal(triggerId, editModal)

    return undefined
  } catch (error) {
    console.error(`Error opening edit prompt modal: ${error}`)
    return undefined
  }
}
