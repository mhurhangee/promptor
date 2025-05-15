import { client, verifyRequest } from '../lib/slack' // adjust path if needed

export async function POST(request: Request) {
  const rawBody = await request.text()

  // Parse x-www-form-urlencoded: payload=<json>
  const params = new URLSearchParams(rawBody)
  const payloadStr = params.get('payload')
  if (!payloadStr) {
    return new Response('Missing payload', { status: 400 })
  }

  const payload = JSON.parse(payloadStr)

  // Slack request verification
  await verifyRequest({ requestType: 'interactive', request, rawBody })

  if (payload.type === 'shortcut') {
    const { callback_id, trigger_id, user } = payload

    if (callback_id === 'new_byte') {
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

      return new Response('OK', { status: 200 })
    }

    return new Response('Unknown shortcut callback_id', { status: 400 })
  }

  return new Response('Not a shortcut payload', { status: 400 })
}
