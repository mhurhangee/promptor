import { waitUntil } from '@vercel/functions'
import { client, verifyRequest } from '../lib/slack' // adjust path if needed

const newByteModal = async (trigger_id: string) => {
  // Open a modal as response
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

export async function byteConfirmationModal(byteName: string) {
  // Create a new modal to show the confirmation
  return {
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
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()

  // Parse x-www-form-urlencoded: payload=<json>
  const params = new URLSearchParams(rawBody)
  const payloadStr = params.get('payload')
  if (!payloadStr) {
    return new Response('Missing payload', { status: 400 })
  }

  const payload = JSON.parse(payloadStr)
  console.log(payload)

  // Slack request verification
  await verifyRequest({ requestType: 'interactive', request, rawBody })

  if (payload.type === 'shortcut') {
    const { callback_id, trigger_id } = payload

    if (callback_id === 'new_byte') {
      waitUntil(newByteModal(trigger_id))
    }

    return new Response('OK', { status: 200 })
  }

  if (payload.type === 'view_submission' && payload.view.callback_id === 'new_byte') {
    const byteName = payload.view.state.values.input_block.byte_name.value

    // For view_submission, we need to return a specific response format
    // to either close the modal or update it with a new view
    const confirmationView = await byteConfirmationModal(byteName)

    // Return the response that Slack expects for view_submission
    return new Response(
      JSON.stringify({
        response_action: 'update',
        view: confirmationView,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }

  return new Response('Not a shortcut payload', { status: 400 })
}
