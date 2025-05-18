/**
 * Handler for the "create_prompt" block action
 */

import { createPromptView } from '../../config/prompt-library-views'
import { client } from '../../slack/client'
import type { SlackBlockAction } from '../types'
import { handlePromptLibraryAction } from './handle-prompt-library-action'

/**
 * Handle creating a new prompt
 *
 * @param payload - The Slack block action payload
 */
export async function handleCreatePrompt(payload: SlackBlockAction): Promise<void> {
  await handlePromptLibraryAction(payload, async () => {
    // Open create prompt modal
    await client.views.open({
      trigger_id: payload.trigger_id,
      view: createPromptView,
    })
  })
}
