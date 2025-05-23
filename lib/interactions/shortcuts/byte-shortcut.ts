/**
 * Byte shortcut handler
 * Handles the creation of new bytes via Slack shortcuts
 */

import { client } from '../../slack'

/**
 * Handles the new byte shortcut
 * Opens a modal for the user to enter a byte name
 */
export async function handleByteShortcut(trigger_id: string): Promise<void> {
  await client.views.open({
    trigger_id,
    view: {
      type: 'modal',
      callback_id: 'new_byte',
      title: {
        type: 'plain_text',
        text: 'New Byte',
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
      },
      blocks: [
        {
          type: 'input',
          block_id: 'input_block',
          label: {
            type: 'plain_text',
            text: 'What is the name of your byte?',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'byte_name',
          },
        },
      ],
    },
  })
}
