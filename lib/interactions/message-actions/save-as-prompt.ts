import { createPromptModal } from '../../config/views'
import { showModal } from '../../slack'

/**
 * Handle the save as prompt message action
 * Opens a modal pre-filled with the message text
 */
export const handleSaveAsPrompt = (triggerId: string, messageText: string): undefined => {
  console.log(
    `Saving message as prompt: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`
  )

  // Create a modified version of the create prompt modal with pre-filled text
  const prefilledModal = {
    ...createPromptModal,
    blocks: createPromptModal.blocks.map((block) => {
      // Pre-fill the prompt text field with the message text
      if ('block_id' in block && block.block_id === 'prompt_text_block' && 'element' in block) {
        return {
          ...block,
          element: {
            ...block.element,
            initial_value: messageText,
          },
        }
      }
      return block
    }),
  }

  // Open the modal with pre-filled text
  showModal(triggerId, prefilledModal)

  return undefined
}
