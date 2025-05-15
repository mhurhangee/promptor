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
export async function handleDinoFactShortcut(trigger_id: string): Promise<void> {
  try {
    // Generate a dinosaur fact using AI
    const dinoFact = await generateDinoFact()

    // Open a modal with the dinosaur fact
    await client.views.open({
      trigger_id,
      view: {
        type: 'modal',
        callback_id: 'dino_fact',
        title: {
          type: 'plain_text',
          text: 'Dino Fact',
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
