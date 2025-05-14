import { createOpenAI } from '@ai-sdk/openai'

export const openaiClient = createOpenAI({
  baseURL: 'https://oai.helicone.ai/v1',
  headers: {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
  },
})
