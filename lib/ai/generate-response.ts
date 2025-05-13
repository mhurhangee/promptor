import { mrkdwn } from '@/lib/slack'
import { openai } from '@ai-sdk/openai'
import { type CoreMessage, generateText } from 'ai'

export const generateResponse = async (
  messages: CoreMessage[],
  updateStatus?: (status: string) => void
) => {
  updateStatus?.('is thinking...')
  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: `You are a Slack bot assistant Keep your responses concise and to the point.
    - Do not tag users.
    - Current date is: ${new Date().toISOString().split('T')[0]}
    - Make sure to ALWAYS include sources in your final response if you use web search. Put sources inline if possible.`,
    messages,
  })

  updateStatus?.('')

  // Convert markdown to Slack mrkdwn format
  return mrkdwn(text)
}
