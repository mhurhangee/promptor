/**
 * Database Types
 * Type definitions for database models
 */

/**
 * Represents a prompt in the library
 */
export interface Prompt {
  id: number
  title: string
  description: string | null
  content: string
  category?: string | null
  tags: string[] | null
  createdBy: string
  createdAt?: Date | null
  upvotes: number | null
  userHasUpvoted?: boolean
}

/**
 * Input for creating a new prompt
 */
export interface CreatePromptInput {
  title: string
  description: string
  content: string
  category?: string
  tags: string[]
  createdBy: string
  upvotes: number
}

/**
 * Represents a user upvote on a prompt
 */
export interface PromptUpvote {
  promptId: number
  userId: string
  createdAt: Date
}
