/**
 * Prompt Recommendation Module
 * Handles AI-based recommendations for prompts based on user queries
 */

import { searchPrompts } from '../db/prompts'
import type { Prompt } from '../db/types'

/**
 * Recommend prompts based on a search query
 *
 * This is a simplified implementation that uses database search
 * rather than complex AI recommendations
 *
 * @param query - The search query to find relevant prompts
 * @returns Array of recommended prompts
 */
export async function recommendPrompts(query: string): Promise<Prompt[]> {
  try {
    // Search for prompts matching the query
    const matchingPrompts = await searchPrompts(query)

    // Transform to ensure type compatibility
    const validPrompts: Prompt[] = matchingPrompts
      .filter((p) => p.title && p.description && p.content)
      .map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        content: p.content,
        category: p.category || undefined,
        tags: p.tags || [],
        createdBy: p.createdBy,
        createdAt: p.createdAt || undefined,
        upvotes: p.upvotes || 0,
      }))

    // Return the top 5 matching prompts
    return validPrompts.slice(0, 5)
  } catch (error) {
    console.error('Error recommending prompts:', error)
    return []
  }
}

/**
 * Format prompt recommendations for display in Slack
 *
 * @param prompts - Array of prompts to format
 * @returns Formatted string for display in Slack
 */
export function formatPromptRecommendations(prompts: Prompt[]): string {
  if (prompts.length === 0) {
    return 'No matching prompts found.'
  }

  // Create a formatted list of prompts
  const promptList = prompts
    .map((prompt) => {
      return `*${prompt.title}*\n${prompt.description}\n\`\`\`\n${prompt.content.substring(0, 100)}${prompt.content.length > 100 ? '...' : ''}\n\`\`\`\n`
    })
    .join('\n')

  return `Here are some prompts that might help:\n\n${promptList}`
}
