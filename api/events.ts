import { eventHandler } from '@/lib/events'
import { getBotId, verifyRequest } from '@/lib/slack'
import type { SlackEvent } from '@slack/web-api'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const payload = JSON.parse(rawBody)
  const requestType = payload.type as 'url_verification' | 'event_callback'

  // See https://api.slack.com/events/url_verification
  if (requestType === 'url_verification') {
    return new Response(payload.challenge, { status: 200 })
  }

  await verifyRequest({ requestType, request, rawBody })

  try {
    const botUserId = await getBotId()
    const event = payload.event as SlackEvent

    eventHandler(event, botUserId)

    return new Response('Success!', { status: 200 })
  } catch (error) {
    console.error('Error generating response', error)
    return new Response('Error generating response', { status: 500 })
  }
}
