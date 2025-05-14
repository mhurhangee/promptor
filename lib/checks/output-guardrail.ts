import type { LanguageModelV1Middleware } from 'ai'
import { generateObject } from 'ai'
import { z } from 'zod'

import { CHECKS } from '../config'

/**
 * Schema for output check response
 */
const OUTPUT_CHECK_SCHEMA = z.object({
  appropriate: z.boolean(),
  reason: z.string(),
})

/**
 * Middleware that checks if the generated text is appropriate and relevant
 * @returns Language model middleware for output guardrails
 */
export const createOutputGuardrailMiddleware = (): LanguageModelV1Middleware => {
  return {
    wrapGenerate: async ({ doGenerate }) => {
      // Get the original result
      const result = await doGenerate()

      // Skip check if there's no text
      if (!result.text) {
        return result
      }

      try {
        // Check if the generated text is appropriate and relevant
        const checkResult = await generateObject({
          model: CHECKS.model,
          temperature: CHECKS.temperature,
          schema: OUTPUT_CHECK_SCHEMA,
          system: CHECKS.outputGuardrailSystem,
          messages: [
            {
              role: 'user',
              content: `Please check if this AI response is appropriate and relevant: "${result.text}"`,
            },
          ],
        })

        console.log('==> checkResult', checkResult.object)

        // If the response is not appropriate, return a properly formatted JSON response
        if (!checkResult.object.appropriate) {
          console.warn('Output guardrail triggered:', checkResult.object.reason)

          // Create a properly formatted JSON response that matches the expected schema
          const safeResponse = JSON.stringify({
            threadTitle: '🚫 Content Moderation',
            responseTitle: '⚠️ Content Filtered',
            response:
              "I apologize, but I'm unable to provide a response to that request. As an AI tutor, I'm designed to provide helpful, educational content related to AI topics. Please feel free to ask me something else about AI concepts or learning resources.",
            followUps: [
              '🤔 What are large language models?',
              '📚 Can you explain neural networks?',
              '🧠 How does machine learning work?',
            ],
          })

          return {
            ...result,
            text: safeResponse,
          }
        }

        // Return the original result if it passes the check
        return result
      } catch (error) {
        // Log the error but allow the original response to pass through
        // This prevents blocking legitimate responses due to API issues
        console.error('Output guardrail check failed:', error)
        return result
      }
    },

    // For streaming responses, we can't easily check the full content
    // before it starts streaming, so we'll just pass it through
    // A more complex implementation could buffer chunks and check periodically
    wrapStream: async ({ doStream }) => {
      return doStream()
    },
  }
}
