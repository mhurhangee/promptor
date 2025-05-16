import { waitUntil } from '@vercel/functions'
import type { SlackShortcut, SlackViewSubmission } from './types'

import { handleAiFormShortcut } from './shortcuts/ai-form-shortcut'
// Import shortcut handlers
import { handleByteShortcut } from './shortcuts/byte-shortcut'
import { handleDinoFactShortcut } from './shortcuts/dino-fact-shortcut'

import { handleAiFormSubmission } from './submissions/ai-form-submission'
// Import submission handlers
import { handleByteSubmission } from './submissions/byte-submission'
import { handleDinoFactSubmission } from './submissions/dino-fact-submission'

/**
 * Routes shortcut interactions to the appropriate handler
 */
export const shortcutHandler = (payload: SlackShortcut) => {
  const { callback_id, trigger_id } = payload

  switch (callback_id) {
    case 'new_byte':
      return waitUntil(handleByteShortcut(trigger_id))
    case 'dino_fact':
      return waitUntil(handleDinoFactShortcut(trigger_id))
    case 'ai_form':
      return waitUntil(handleAiFormShortcut(trigger_id))
    default:
      console.warn(`Unknown shortcut callback_id: ${callback_id}`)
      return null
  }
}

/**
 * Routes view submission interactions to the appropriate handler
 */
export const viewSubmissionHandler = async (payload: SlackViewSubmission) => {
  const { view } = payload

  switch (view.callback_id) {
    case 'new_byte': {
      const byteName = view.state.values.input_block.byte_name.value
      return await handleByteSubmission(byteName)
    }
    case 'dino_fact': {
      return await handleDinoFactSubmission()
    }
    case 'ai_form': {
      const prompt = view.state.values.prompt_block.user_prompt.value
      return await handleAiFormSubmission(prompt)
    }
    default: {
      console.warn(`Unknown view submission callback_id: ${view.callback_id}`)
      return null
    }
  }
}
