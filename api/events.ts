// Event handler API endpoint

import { eventHandler } from '../lib/events'
import { getAuthTest, verifyRequest } from '../lib/slack'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const payload = JSON.parse(rawBody)
  const requestType = payload.type as 'url_verification' | 'event_callback'

  // See https://api.slack.com/events/url_verification
  if (requestType === 'url_verification') {
    return new Response(payload.challenge, { status: 200 })
  }

  // Verify slack request
  await verifyRequest({ requestType, request, rawBody })

  try {
    const authTest = await getAuthTest()
    console.log('authTest', authTest)
    eventHandler(payload.event)

    return new Response('Success!', { status: 200 })
  } catch (error) {
    console.error('Error generating response', error)
    return new Response('Error generating response', { status: 500 })
  }
}
