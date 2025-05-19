/**
 * Slack Interactions API Endpoint
 * Handles all interactive components from Slack (shortcuts, view submissions, etc.)
 *
 * This endpoint receives and processes all interactive components from Slack:
 * - Global shortcuts
 * - Message actions
 * - Block actions (buttons, select menus, etc.)
 * - View submissions (modal form submissions)
 * - View closed events
 */

import { waitUntil } from '@vercel/functions'
import { interactionHandler } from '../lib/interactions'
import type { SlackInteractionPayload } from '../lib/interactions/types'
import { isValidSlackRequest } from '../lib/slack'

/**
 * Main POST handler for all Slack interactions
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text()

  // Parse x-www-form-urlencoded: payload=<json>
  const params = new URLSearchParams(rawBody)
  const payloadStr = params.get('payload')
  if (!payloadStr) {
    return new Response('Missing payload', { status: 400 })
  }

  // Verify Slack request
  const validRequest = await isValidSlackRequest({ request, rawBody })
  if (!validRequest) {
    console.error('Invalid Slack request signature')
    return new Response('Invalid request', { status: 401 })
  }

  try {
    // Parse the payload and validate it's a proper Slack interaction
    const payload = JSON.parse(payloadStr) as SlackInteractionPayload

    // Validate that the payload has a type property
    if (!payload.type) {
      console.error('Invalid payload: missing type property')
      return new Response('Invalid payload format', { status: 400 })
    }

    // Handle the interaction
    const result = interactionHandler(payload)

    // If the handler returns a response (like for view_submission), use it
    if (result && typeof result === 'object') {
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // For async operations that don't need immediate response
    waitUntil(Promise.resolve(result))

    // Return a 200 OK for Slack
    return new Response('', { status: 200 })
  } catch (error) {
    console.error('Error handling interaction:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
