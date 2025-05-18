// lib/db/schema.ts
import { pgTable, serial, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';

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
  tags: text('tags').array(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  upvotes: integer('upvotes').default(0),
});

/**
 * Schema for tracking which users have upvoted which prompts
 * Prevents users from upvoting the same prompt multiple times
 */
export const userUpvotes = pgTable(
  'user_upvotes',
  {
    userId: text('user_id').notNull(),
    promptId: integer('prompt_id').notNull().references(() => prompts.id),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.promptId] }),
    };
  },
);