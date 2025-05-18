import { desc, eq, sql } from 'drizzle-orm'
import { db } from './index'
import { prompts } from './schema'

/**
 * Types for prompt operations
 */
export type Prompt = typeof prompts.$inferSelect
export type NewPrompt = typeof prompts.$inferInsert

/**
 * Get all prompts, optionally filtered by category
 */
export async function getAllPrompts(category?: string) {
  if (category) {
    return db
      .select()
      .from(prompts)
      .where(eq(prompts.category, category))
      .orderBy(desc(prompts.createdAt))
  }
  return db.select().from(prompts).orderBy(desc(prompts.createdAt))
}

/**
 * Get a prompt by ID
 */
export async function getPromptById(id: number) {
  const results = await db.select().from(prompts).where(eq(prompts.id, id))
  return results[0] || null
}

/**
 * Create a new prompt
 */
export async function createPrompt(prompt: NewPrompt) {
  const result = await db.insert(prompts).values(prompt).returning()
  return result[0]
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(id: number, updates: Partial<NewPrompt>) {
  const result = await db.update(prompts).set(updates).where(eq(prompts.id, id)).returning()
  return result[0]
}

/**
 * Delete a prompt
 */
export async function deletePrompt(id: number) {
  return db.delete(prompts).where(eq(prompts.id, id))
}
