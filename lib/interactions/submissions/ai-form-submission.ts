/**
 * AI form submission handler
 * Handles the submission of AI form modals
 */

import { generateText } from 'ai'
import { openaiClient } from '../../config/openai'
import { mrkdwn } from '../../slack'

/**
 * Handles the submission of the AI form modal
 * Processes the user's prompt with the AI SDK and returns the response
 */
export async function handleAiFormSubmission(prompt: string) {
  try {
    // Generate a response using the AI SDK
    const response = await generateAiResponse(prompt)

    // Format the response for display in Slack
    const formattedResponse = mrkdwn(response)

    return {
      response_action: 'update',
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'AI Response',
        },
        close: {
          type: 'plain_text',
          text: 'Close',
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Your question:*\n>${prompt}`,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: formattedResponse,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: "Powered by Promptor's AI",
              },
            ],
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error generating AI response:', error)

    return {
      response_action: 'update',
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Error',
        },
        close: {
          type: 'plain_text',
          text: 'Close',
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: "🤖 I'm sorry, I couldn't process your request. Please try again later.",
            },
          },
        ],
      },
    }
  }
}

/**
 * Generates a response to the user's prompt using the AI SDK
 */
async function generateAiResponse(prompt: string) {
  const { text } = await generateText({
    model: openaiClient.responses('gpt-4.1-mini'),
    system:
      'You are Promptor, a helpful AI assistant that specializes in explaining AI concepts. Your responses should be educational, concise, and easy to understand. Use markdown formatting for better readability.',
    prompt: prompt,
    temperature: 0.7,
    maxTokens: 500,
  })

  return text
}
