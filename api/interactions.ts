/**
 * Slack Interactions API Endpoint
 * Handles all interactive components from Slack (shortcuts, view submissions, etc.)
 */

import { waitUntil } from '@vercel/functions'
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

  // Log the payload for debugging
  console.log('Interaction payload:', payload)

  // Handle different interaction types
  try {
    // Immediately respond to Slack to meet the 3-second requirement
    // Then process the interaction asynchronously using waitUntil
    waitUntil(interactionHandler(payload))

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error handling interaction:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
