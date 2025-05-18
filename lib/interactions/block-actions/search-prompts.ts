/**
 * Handler for the "search_prompts" block action
 */

import { browsePromptsView } from '../../config/prompt-library-views'
import { getAllPrompts, searchPrompts } from '../../db/prompts'
import { client } from '../../slack/client'
import type { SlackBlockAction, SlackSelectStateValue, SlackViewStateValue } from '../types'
import { handlePromptLibraryAction } from './handle-prompt-library-action'

/**
 * Handle searching prompts
 *
 * @param payload - The Slack block action payload
 */
export async function handleSearchPrompts(payload: SlackBlockAction): Promise<void> {
  await handlePromptLibraryAction(payload, async () => {
    if (!payload.view?.state?.values) {
      throw new Error('View state is missing')
    }

    // Log the entire payload for debugging
    console.log('Search payload:', JSON.stringify(payload, null, 2))

    // Get search query and category from view state
    const searchInput = payload.view.state.values.search_block?.search_input as
      | SlackViewStateValue
      | undefined
    const searchQuery = searchInput?.value

    const categorySelect = payload.view.state.values.category_block?.category_select as
      | SlackSelectStateValue
      | undefined
    const categoryOption = categorySelect?.selected_option
    const category = categoryOption?.value !== 'all' ? categoryOption?.value : undefined

    console.log('Search query:', searchQuery)
    console.log('Category:', category)

    let prompts = []

    try {
      // Search based on query or category
      if (searchQuery && searchQuery.trim() !== '') {
        console.log('Searching for prompts with query:', searchQuery)
        prompts = await searchPrompts(searchQuery)
      } else if (category) {
        console.log('Filtering prompts by category:', category)
        prompts = await getAllPrompts(category)
      } else {
        console.log('Getting all prompts')
        prompts = await getAllPrompts()
      }

      console.log('Found prompts:', prompts.length)

      // Update the view with search results
      if (payload.view?.id) {
        await client.views.update({
          view_id: payload.view.id,
          view: browsePromptsView(prompts, category),
        })
      }
    } catch (error) {
      console.error('Error searching prompts:', error)
      throw error
    }
  })
}
