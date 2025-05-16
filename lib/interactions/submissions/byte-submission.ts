/**
 * Byte submission handler
 * Handles the submission of byte creation modals
 */

/**
 * Handles the submission of the new byte modal
 * Returns a confirmation view
 */
export async function handleByteSubmission(byteName: string) {
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
