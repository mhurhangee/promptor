import { waitUntil } from '@vercel/functions'
import type { SlackShortcut } from './types'

// Import shortcut handlers
import { handleAiFormShortcut } from './shortcuts/ai-form-shortcut'
import { handleByteShortcut } from './shortcuts/byte-shortcut'
import { handleDinoFactShortcut } from './shortcuts/dino-fact-shortcut'
import { handleBrowsePromptsShortcut } from './shortcuts/prompt-library-shortcut'
import { handleCreatePromptShortcut } from './shortcuts/prompt-library-shortcut'

/**
 * Routes shortcut interactions to the appropriate handler
 *
 * @param payload - The Slack shortcut payload
 * @returns Nothing - this function is used for its side effects
 */
export const shortcutHandler = (payload: SlackShortcut): void => {
  const { callback_id, trigger_id } = payload

  switch (callback_id) {
    case 'new_byte':
      waitUntil(handleByteShortcut(trigger_id))
      break
    case 'dino_fact':
      waitUntil(handleDinoFactShortcut(trigger_id))
      break
    case 'ai_form':
      waitUntil(handleAiFormShortcut(trigger_id))
      break
    case 'browse_prompts':
      waitUntil(handleBrowsePromptsShortcut(trigger_id))
      break
    case 'create_prompt':
      waitUntil(handleCreatePromptShortcut(trigger_id))
      break
    default:
      console.warn(`Unknown shortcut callback_id: ${callback_id}`)
    // No action needed for unknown shortcuts
  }
}
