import { type CoreMessage, generateText } from 'ai'

import { AI_CONFIG, THINKING_MESSAGES } from '../config'
import { mrkdwn } from '../slack'
import { getRandomItem } from '../utils'

export const generateResponse = async (
  messages: CoreMessage[],
  updateStatus?: (status: string) => void
) => {
  // Update status to thinking
  updateStatus?.(getRandomItem(THINKING_MESSAGES))

  // Generate response
  const { text } = await generateText({
    model: AI_CONFIG.model,
    system: AI_CONFIG.system,
    maxRetries: AI_CONFIG.maxRetries,
    maxTokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature,
    messages,
  })

  // Update status to done
  updateStatus?.('')

  // Convert markdown to Slack mrkdwn format
  return mrkdwn(text)
}
