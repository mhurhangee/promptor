/**
 * Prompt Library Action Handlers
 * Handles all block actions related to the prompt library feature
 */

import {
  browsePromptsView,
  createPromptView,
  promptDetailView,
} from '../../config/prompt-library-views'
import { getAllPrompts, getPromptById, searchPrompts, upvotePrompt } from '../../db/prompts'
import { client } from '../../slack/client'

/**
 * Handle opening the prompt library from home tab
 */
export async function handleOpenPromptLibrary(triggerId: string): Promise<void> {
  // Get all prompts
  const prompts = await getAllPrompts()

  // Open browse prompts modal
  await client.views.open({
    trigger_id: triggerId,
    view: browsePromptsView(prompts),
  })
}

/**
 * Handle creating a new prompt
 */
export async function handleCreatePrompt(triggerId: string): Promise<void> {
  // Open create prompt modal
  await client.views.open({
    trigger_id: triggerId,
    view: createPromptView,
  })
}

/**
 * Handle viewing prompt details
 */
export async function handleViewPromptDetails(triggerId: string, promptId: number): Promise<void> {
  // Get prompt details
  const prompt = await getPromptById(promptId)
  if (!prompt) {
    throw new Error(`Prompt with ID ${promptId} not found`)
  }

  // Add user upvote status (placeholder - would need to check DB)
  const promptWithStatus = {
    ...prompt,
    userHasUpvoted: false,
  }

  // Open prompt detail modal
  await client.views.open({
    trigger_id: triggerId,
    view: promptDetailView(promptWithStatus),
  })
}

/**
 * Handle toggling upvote on a prompt
 */
export async function handleToggleUpvote(
  userId: string,
  promptId: number,
  viewId?: string
): Promise<void> {
  // Toggle upvote
  const upvoteAdded = await upvotePrompt(promptId, userId)

  // Get updated prompt
  const updatedPrompt = await getPromptById(promptId)
  if (!updatedPrompt) {
    throw new Error(`Prompt with ID ${promptId} not found`)
  }

  // Add upvote status
  const promptWithStatus = {
    ...updatedPrompt,
    userHasUpvoted: upvoteAdded,
  }

  // Update the modal if view ID is provided
  if (viewId) {
    await client.views.update({
      view_id: viewId,
      view: promptDetailView(promptWithStatus),
    })
  }
}

/**
 * Handle searching prompts
 */
export async function handleSearchPrompts(
  viewId: string,
  searchQuery?: string,
  category?: string
): Promise<void> {
  let prompts = []

  // Search based on query or category
  if (searchQuery && searchQuery.trim() !== '') {
    prompts = await searchPrompts(searchQuery)
  } else if (category && category !== 'all') {
    prompts = await getAllPrompts(category)
  } else {
    prompts = await getAllPrompts()
  }

  // Update the view with search results
  await client.views.update({
    view_id: viewId,
    view: browsePromptsView(prompts, category),
  })
}

/**
 * Handle copying a prompt to clipboard (sends as DM)
 */
export async function handleCopyPrompt(userId: string, promptId: number): Promise<void> {
  // Get prompt
  const prompt = await getPromptById(promptId)
  if (!prompt) {
    throw new Error(`Prompt with ID ${promptId} not found`)
  }

  // Send prompt content to user as DM
  await client.chat.postMessage({
    channel: userId,
    text: `Here's the prompt you requested:\n\n*${prompt.title}*\n\n\`\`\`\n${prompt.content}\n\`\`\``,
  })
}
