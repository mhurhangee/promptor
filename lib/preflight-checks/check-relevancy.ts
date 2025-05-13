import type { CoreMessage } from 'ai'
import { type GenerateObjectResult, generateObject } from 'ai'
import { z } from 'zod'
import { AI_CONFIG } from '../config'
import type { PreflightCheckResult } from './run-preflight-check'

const RELEVANCY_SCHEMA = z.object({
  relevant: z.boolean(),
  reason: z.string(),
})

//Checks if the user's message is relevant to the chatbot's purpose
export async function checkRelevancy(messages: CoreMessage[]): Promise<PreflightCheckResult> {
  try {
    //Check up to the last 5 messages (from the user)
    const lastMessages = messages.slice(-5)

    // Use generateObject to check relevancy
    const result: GenerateObjectResult<typeof RELEVANCY_SCHEMA._type> = await generateObject({
      model: AI_CONFIG.model,
      schema: RELEVANCY_SCHEMA,
      system: AI_CONFIG.relevancySystem,
      messages: lastMessages,
    })

    console.log('==> relevancy result', result.object)

    if (!result.object.relevant) {
      return {
        passed: false,
        errorMessage: `I'm designed to help with AI-related topics. ${result.object.reason}`,
      }
    }

    return { passed: true }
  } catch (error) {
    console.error('Relevancy check failed:', error)
    // If relevancy check fails, we allow the message to pass
    return { passed: true }
  }
}
