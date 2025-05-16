/**
 * Dinosaur fact submission handler
 * Handles the submission of dinosaur fact modals
 */

/**
 * Handles the submission of the dinosaur fact modal
 * Returns a thank you view
 */
export const handleDinoFactSubmission = async () => {
  return {
    response_action: 'update',
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Thanks!',
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
            text: '🦕 Thanks for checking out our dino facts! Come back for more prehistoric knowledge!',
          },
        },
      ],
    },
  }
}
