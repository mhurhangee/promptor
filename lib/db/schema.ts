// lib/db/schema.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * Schema for the prompts table
 * Stores all prompts in the library
 */
export const prompts = pgTable('prompts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  description: text('description'),
  category: text('category'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

/**
 * Types for prompt operations
 */
export type Prompt = typeof prompts.$inferSelect
export type NewPrompt = typeof prompts.$inferInsert
