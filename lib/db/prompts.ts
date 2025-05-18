import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from './index'
import { prompts, userUpvotes } from './schema'

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
      .orderBy(desc(prompts.upvotes))
  }
  return db.select().from(prompts).orderBy(desc(prompts.upvotes))
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

/**
 * Search prompts by title, description, or content
 */
export async function searchPrompts(query: string) {
  return db
    .select()
    .from(prompts)
    .where(
      sql`to_tsvector('english', ${prompts.title} || ' ' || ${prompts.description} || ' ' || ${prompts.content}) @@ to_tsquery('english', ${query.replace(/ /g, ' & ')})`
    )
    .orderBy(desc(prompts.upvotes))
}

/**
 * Upvote a prompt
 */
export async function upvotePrompt(promptId: number, userId: string) {
  // Check if user has already upvoted this prompt
  const existingUpvote = await db
    .select()
    .from(userUpvotes)
    .where(and(eq(userUpvotes.promptId, promptId), eq(userUpvotes.userId, userId)))

  if (existingUpvote.length > 0) {
    // User already upvoted, remove upvote
    await db
      .delete(userUpvotes)
      .where(and(eq(userUpvotes.promptId, promptId), eq(userUpvotes.userId, userId)))

    // Decrease upvote count
    await db
      .update(prompts)
      .set({
        upvotes: sql`${prompts.upvotes} - 1`,
      })
      .where(eq(prompts.id, promptId))

    return false // Upvote removed
  }

  await db.insert(userUpvotes).values({
    promptId,
    userId,
  })

  // Increase upvote count
  await db
    .update(prompts)
    .set({
      upvotes: sql`${prompts.upvotes} + 1`,
    })
    .where(eq(prompts.id, promptId))

  return true // Upvote added
}

/**
 * Get prompts by tag
 */
export async function getPromptsByTag(tag: string) {
  return db
    .select()
    .from(prompts)
    .where(sql`${tag} = ANY(${prompts.tags})`)
    .orderBy(desc(prompts.upvotes))
}
