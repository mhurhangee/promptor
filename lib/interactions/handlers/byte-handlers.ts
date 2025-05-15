import { client } from '../../slack'

/**
 * Handles the new byte shortcut
 * Opens a modal for the user to enter a byte name
 */
export const handleByteShortcut = async (trigger_id: string) => {
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

/**
 * Handles the submission of the new byte modal
 * Returns a confirmation view
 */
export const handleByteSubmission = async (byteName: string) => {
  return {
    response_action: 'update',
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Confirm Byte',
      },
      close: {
        type: 'plain_text',
        text: 'Close',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `You created a byte called *${byteName}* 🚀`,
          },
        },
      ],
    },
  }
}
