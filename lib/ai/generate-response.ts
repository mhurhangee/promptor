import { type CoreMessage, Output, generateText } from 'ai'

import { AI_CONFIG, RESPONSE_SCHEMA, THINKING_MESSAGES } from '../config'
import { mrkdwn } from '../slack'
import { getRandomItem } from '../utils'

export const generateResponse = async (
  messages: CoreMessage[],
  updateStatus?: (status: string) => void
) => {
  // Update status to thinking
  updateStatus?.(getRandomItem(THINKING_MESSAGES))
  try {
    // Generate response
    const { experimental_output: output } = await generateText({
      model: AI_CONFIG.model,
      system: AI_CONFIG.system,
      maxRetries: AI_CONFIG.maxRetries,
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      maxSteps: AI_CONFIG.maxSteps,
      tools: AI_CONFIG.tools,
      experimental_output: Output.object({ schema: RESPONSE_SCHEMA }),
      messages,
    })

    // Update status to done
    updateStatus?.('')

    // Convert markdown to Slack mrkdwn format
    return {
      threadTitle: output.threadTitle,
      responseTitle: output.responseTitle,
      response: mrkdwn(output.response),
      followUps: output.followUps,
    }
  } catch (error) {
    console.error('Error generating response:', error)
    return {
      threadTitle: 'Please start a new thread',
      responseTitle: '🚧 I have gone (temporarily) extinct',
      response: mrkdwn('🥺 I was unable to generate a response. Please try again.'),
      followUps: null,
    }
  }
}
