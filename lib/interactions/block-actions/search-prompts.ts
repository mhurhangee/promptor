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

    let prompts = []

    // Search based on query or category
    if (searchQuery && searchQuery.trim() !== '') {
      prompts = await searchPrompts(searchQuery)
    } else if (category) {
      prompts = await getAllPrompts(category)
    } else {
      prompts = await getAllPrompts()
    }

    // Update the view with search results
    if (payload.view?.id) {
      await client.views.update({
        view_id: payload.view.id,
        view: browsePromptsView(prompts, category),
      })
    }
  })
}
