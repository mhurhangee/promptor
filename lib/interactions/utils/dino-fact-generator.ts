/**
 * Dinosaur fact generator
 * Generates fun facts about dinosaurs using the AI SDK
 */

import { generateObject } from 'ai'
import { z } from 'zod'
import { openaiClient } from '../../config/openai'

// Schema for the dinosaur fact
const DinoFactSchema = z.object({
  title: z.string().describe('A catchy title for the dinosaur fact'),
  fact: z.string().describe('An interesting fact about dinosaurs'),
  funEmoji: z.string().describe('A fun emoji related to dinosaurs or prehistoric times'),
})

// Type for the dinosaur fact
export type DinoFact = z.infer<typeof DinoFactSchema>

/**
 * Generates a fun fact about dinosaurs using the AI SDK
 */
export async function generateDinoFact(): Promise<DinoFact> {
  const { object } = await generateObject({
    model: openaiClient.responses('gpt-4.1-mini'),
    system:
      'You are a paleontologist who specializes in dinosaurs. Generate a fun, educational, and accurate fact about dinosaurs that would be interesting to share.',
    prompt:
      "Generate a fun fact about dinosaurs. Make it educational, accurate, and interesting. A user may ask several times for a new fact and you won't know the previous fact, so try and make it interesting and varied each time. ",
    schema: DinoFactSchema,
  })

  return object
}
