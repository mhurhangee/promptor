// Main AI logic - generate response to user's message, handle preflight checks, and generate response with guardrails

import { type CoreMessage, Output, generateText } from 'ai'

import { runPreflightChecks } from '../checks'
import { AI_CONFIG, RESPONSE_SCHEMA, THINKING_MESSAGES } from '../config'
import { mrkdwn } from '../slack'
import { getRandomItem } from '../utils'
import { type HeliconeTrackingData, generateHeliconeHeaders } from './helicone-utils'

export const generateResponse = async (
  messages: CoreMessage[],
  trackingData: HeliconeTrackingData,
  updateStatus?: (status: string) => void
) => {
  // Update status to thinking
  updateStatus?.(getRandomItem(THINKING_MESSAGES))

  try {
    // Run preflight checks on the messages
    const preflightResult = await runPreflightChecks(messages)

    // If preflight checks failed, return the error message
    if (!preflightResult.passed) {
      updateStatus?.('')
      return {
        threadTitle: 'Moderation Notice',
        responseTitle: '⚠️ Message Moderation',
        response: mrkdwn(
          preflightResult.errorMessage ||
            'Your message could not be processed due to moderation policies.'
        ),
        followUps: null,
      }
    }

    // Update status to thinking
    updateStatus?.(getRandomItem(THINKING_MESSAGES))

    // Set operation for Helicone tracking
    trackingData.operation = 'generateResponse'

    // Generate Helicone tracking headers if tracking data is provided
    const heliconeHeaders = generateHeliconeHeaders(trackingData, true, true) // Enable caching and rate limiting

    // Generate response with guardrails
    const { experimental_output: output } = await generateText({
      model: AI_CONFIG.model,
      system: AI_CONFIG.system,
      maxRetries: AI_CONFIG.maxRetries,
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      maxSteps: AI_CONFIG.maxSteps,
      tools: AI_CONFIG.tools,
      experimental_output: Output.object({ schema: RESPONSE_SCHEMA }),
      messages: messages,
      headers: heliconeHeaders,
    })

    // Update status to done
    updateStatus?.('')

    return {
      threadTitle: output.threadTitle,
      responseTitle: output.responseTitle,
      response: mrkdwn(output.response), // Convert markdown to Slack mrkdwn format
      followUps: output.followUps,
    }
  } catch (error) {
    console.error('Error generating response:', error)
    return {
      threadTitle: 'Please start a new thread',
      responseTitle: '🚧 I have gone (temporarily) extinct',
      response: '🥺 I was unable to generate a response. Please try again.',
      followUps: null,
    }
  }
}
