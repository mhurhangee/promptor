/**
 * Slack Interactions API Endpoint
 * Handles all interactive components from Slack (shortcuts, view submissions, etc.)
 */

import { interactionHandler } from '../lib/interactions'
import { verifyRequest } from '../lib/slack'

/**
 * Main POST handler for all Slack interactions
 */
export async function POST(request: Request) {
  const rawBody = await request.text()

  // Parse x-www-form-urlencoded: payload=<json>
  const params = new URLSearchParams(rawBody)
  const payloadStr = params.get('payload')
  if (!payloadStr) {
    return new Response('Missing payload', { status: 400 })
  }

  const payload = JSON.parse(payloadStr)

  // Verify Slack request
  await verifyRequest({ requestType: 'interactive', request, rawBody })

  // Handle different interaction types
  try {
    interactionHandler(payload)

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error handling interaction:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
