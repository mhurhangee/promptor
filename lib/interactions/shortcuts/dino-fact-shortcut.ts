/**
 * Dinosaur fact shortcut handler
 * Handles the generation of fun dinosaur facts via Slack shortcuts
 */

import { client } from '../../slack'
import { generateDinoFact } from '../utils/dino-fact-generator'

/**
 * Handles the dinosaur fact shortcut
 * Opens a modal with a generated dinosaur fact
 */
export const handleDinoFactShortcut = async (trigger_id: string) => {
  try {
    // First, open a modal with a loading indicator immediately
    const response = await client.views.open({
      trigger_id,
      view: {
        type: 'modal',
        callback_id: 'dino_fact',
        title: {
          type: 'plain_text',
          text: '!! Dino Fact !!',
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '🦖 *Excavating dinosaur facts...*',
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: 'Please wait while we dig up something interesting...',
              },
            ],
          },
        ],
      },
    })

    // Store the view ID for later update
    const viewId = response.view?.id

    if (!viewId) {
      console.error('Failed to get view ID from response')
      return
    }

    // Generate the dinosaur fact AFTER showing the loading state
    // This ensures the loading state is visible to the user
    const dinoFact = await generateDinoFact()

    // Once we have the fact, update the modal with the content
    await client.views.update({
      view_id: viewId,
      view: {
        type: 'modal',
        callback_id: 'dino_fact',
        title: {
          type: 'plain_text',
          text: '!! Dino Fact !!',
        },
        submit: {
          type: 'plain_text',
          text: 'Cool!',
        },
        close: {
          type: 'plain_text',
          text: 'Close',
        },
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${dinoFact.title} ${dinoFact.funEmoji}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: dinoFact.fact,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: "Fun facts powered by Promptor's AI",
              },
            ],
          },
        ],
      },
    })
  } catch (error) {
    console.error('Error generating dinosaur fact:', error)

    // Open an error modal if generation fails
    await client.views.open({
      trigger_id,
      view: {
        type: 'modal',
        callback_id: 'dino_fact',
        title: {
          type: 'plain_text',
          text: 'Dino Fact',
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
              text: '🦖 Oops! Our dinosaurs are taking a nap. Try again later!',
            },
          },
        ],
      },
    })
  }
}
