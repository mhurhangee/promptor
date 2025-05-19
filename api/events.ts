// Event handler API endpoint

import { eventHandler } from '../lib/events'
import { verifyRequest } from '../lib/slack'

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

  // Handle event asynchronously
  try {
    // We need to await the event handler for the home view
    // but we don't want to block the response for other events
    await eventHandler(payload.event)
    return new Response('Success!', { status: 200 })
  } catch (error) {
    console.error('Error handling event', error)
    return new Response('Error handling event', { status: 500 })
  }
}
