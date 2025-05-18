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
    // Special handling for different interaction types
    if (payload.type === 'view_submission') {
      // For view submissions, we need to return the response from the handler
      // This is because Slack expects a response for form validations
      const response = await interactionHandler(payload)

      // If we have a response (e.g., validation errors), return it
      if (response) {
        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Otherwise return an empty success response
      return new Response('', { status: 200 })
    }

    if (payload.type === 'block_actions') {
      // For block actions that open modals, we need to execute them directly
      // This ensures modals open properly before we respond to Slack
      await interactionHandler(payload)
      return new Response('OK', { status: 200 })
    }
    // For all other interaction types, respond immediately and process asynchronously
    waitUntil(interactionHandler(payload))
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error handling interaction:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
