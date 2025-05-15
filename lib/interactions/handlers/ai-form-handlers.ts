import { generateText } from 'ai'
import { openaiClient } from '../../config/openai'
import { client } from '../../slack'
import { mrkdwn } from '../../slack'

/**
 * Handles the AI form shortcut
 * Opens a modal for the user to enter a prompt
 */
export const handleAiFormShortcut = async (trigger_id: string) => {
  await client.views.open({
    trigger_id,
    view: {
      type: 'modal',
      callback_id: 'ai_form',
      title: {
        type: 'plain_text',
        text: 'AI Assistant',
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "✨ *Ask me anything about AI!* ✨\nI'll do my best to provide a helpful response.",
          },
        },
        {
          type: 'input',
          block_id: 'prompt_block',
          label: {
            type: 'plain_text',
            text: 'What would you like to know?',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'user_prompt',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'E.g., Explain how large language models work...',
            },
          },
        },
      ],
    },
  })
}

/**
 * Handles the submission of the AI form modal
 * Processes the user's prompt with the AI SDK and returns the response
 */
export const handleAiFormSubmission = async (prompt: string) => {
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
