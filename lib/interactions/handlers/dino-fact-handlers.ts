import { Output, generateObject } from 'ai'
import { z } from 'zod'
import { openaiClient } from '../../config/openai'
import { client } from '../../slack'

// Schema for the dinosaur fact
const DinoFactSchema = z.object({
  title: z.string().describe('A catchy title for the dinosaur fact'),
  fact: z.string().describe('An interesting fact about dinosaurs'),
  funEmoji: z.string().describe('A fun emoji related to dinosaurs or prehistoric times'),
})

/**
 * Handles the dinosaur fact shortcut
 * Opens a modal with a generated dinosaur fact
 */
export const handleDinoFactShortcut = async (trigger_id: string) => {
  try {
    // Generate a dinosaur fact using AI
    const dinoFact = await generateDinoFact()

    // First, open a modal with a loading indicator
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

    // Once we have the fact, update the modal with the content
    await client.views.update({
      view_id: response.view?.id || '',
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

/**
 * Generates a fun fact about dinosaurs using the AI SDK
 */
async function generateDinoFact() {
  const { object } = await generateObject({
    model: openaiClient.responses('gpt-4.1-mini'),
    system:
      'You are a paleontologist who specializes in dinosaurs. Generate a fun, educational, and accurate fact about dinosaurs that would be interesting to share.',
    prompt:
      "Generate a fun fact about dinosaurs. Make it educational, accurate, and interesting. A user may ask several times for a new fact and you won't know the previous fact, so try and make it interesting and varied each time. ",
    schema: DinoFactSchema,
  })

  return object
}
