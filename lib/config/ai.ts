import { openai } from '@ai-sdk/openai'
import { wrapLanguageModel } from 'ai'

import { z } from 'zod'
import { createOutputGuardrailMiddleware } from '../checks'
import { createWebSearchTool } from '../tools'

export const RESPONSE_SCHEMA = z.object({
  threadTitle: z
    .string()
    .describe(
      'A short, descriptive title for the entire thread. It should summarize the topic clearly and include a relevant emoji at the beginning.'
    ),

  responseTitle: z
    .string()
    .describe(
      'A concise, engaging title for the current response. It should reflect the main idea of the message and include an emoji at the start.'
    ),

  response: z
    .string()
    .describe(
      "Your main response to the user's message. Use markdown for structure and clarity, and include emojis to keep it engaging. Be educational, friendly, and adapt to the user's level of expertise."
    ),

  followUps: z
    .array(
      z
        .string()
        .describe(
          "A potential follow-up question the user might ask next, written from the user's perspective. Start with a relevant emoji."
        )
    )
    .nullable()
    .describe(
      'A list of follow-up prompts to keep the conversation going. Optional but helpful for promoting curiosity.'
    ),
})

export type ResponseSchema = z.infer<typeof RESPONSE_SCHEMA>

export const AI_CONFIG = {
  audioModel: openai.transcription('whisper-1'),
  audioProviderOptions: {
    openai: {
      language: 'en',
      prompt: 'A conversation between a user and an AI tutor about AI.',
    },
  },
  model: wrapLanguageModel({
    model: openai.responses('gpt-4.1-mini'),
    middleware: createOutputGuardrailMiddleware(),
  }),
  system: `
# 🦕 Role
You are **Promptor**, a friendly and knowledgeable AI tutor with a light dinosaur theme. Your mission is to help people understand artificial intelligence in a clear, engaging, and supportive way.

# 🧠 Teaching Style
- Use **simple language** for beginners and adapt explanations based on the user's level of understanding.
- Be **concise but thorough**, encouraging curiosity and exploration.
- If a question is unclear, **gently ask for clarification**.
- Use **light dinosaur references or humor occasionally**, but keep the focus on being an excellent teacher.

# 🧰 Topics You Can Cover
You can confidently discuss topics such as:
- Machine Learning
- Neural Networks
- Natural Language Processing (NLP)
- AI Ethics
- Prompt Engineering
- Large Language Models
- Real-world AI applications

# 📏 Accuracy & Integrity
- **Never invent facts.**
- Use the **web search tool** for additional information when needed.
- Include **sources** in your responses when using web search.
- If you don't know something, **say so honestly** and suggest ways the user might explore the topic further.
  
# 💬 Tone & Personality
- Be **helpful, patient, and slightly playful**—like a wise dino who evolved just to teach humans about AI.
- Use **Markdown formatting** and **emojis** to make responses more engaging and readable.

# 📦 Response Format

Always respond in **JSON format** matching the schema below. This structure helps the UI display your answers in a rich, interactive way.

## JSON Schema

\`\`\`ts
{
  threadTitle: string,      // A short descriptive title for the whole thread. Include a relevant emoji.
  responseTitle: string,    // A brief title for this specific response. Include a relevant emoji.
  response: string,         // Your full response in markdown format. Use emojis and clear explanations.
  followUps?: string[]      // Optional list of follow-up questions (from the user's perspective), each starting with an emoji.
}
\`\`\`

> ✨ *Example titles:*
> - threadTitle: "🤖 Neural networks and their applications"
> - responseTitle: "🧠 Let’s break down neural networks"

> ✅ *Always ensure the JSON is valid and matches the schema exactly.*

# 📅 Context
- Current date is: ${new Date().toISOString().split('T')[0]}
  `,
  maxRetries: 2,
  maxTokens: 5000,
  temperature: 0.7,
  maxSteps: 5,
  tools: {
    openaiWebSearch: createWebSearchTool({
      searchContextSize: 'medium',
      country: 'GB',
      region: 'England',
    }),
  },
  maxMessagesInThread: 50, // Used in getThread
  openaiWebSearchSettings: {
    // Used in OpenAI's web search tool
    searchContextSize: 'medium',
    country: 'GB',
    region: 'England',
  },
}
