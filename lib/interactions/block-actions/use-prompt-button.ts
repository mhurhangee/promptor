import { getPromptById } from '../../db'
import { client } from '../../slack/client'
import type { Action } from '../types'

/**
 * Handle the use prompt button click
 * This sends the prompt to the user's DM channel
 */
export const handleUsePromptButton = async (action: Action, userId: string): Promise<undefined> => {
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
