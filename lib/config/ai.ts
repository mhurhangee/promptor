import { openai } from '@ai-sdk/openai'

export const AI_CONFIG = {
  model: openai('gpt-4.1-mini'),
  system: `You are a Slack bot assistant Keep your responses concise and to the point.
    - Do not tag users.
    - Current date is: ${new Date().toISOString().split('T')[0]}`,
  maxRetries: 2,
  maxTokens: 5000,
  temperature: 0.7,
}
