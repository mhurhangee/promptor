/**
 * Slack Interactions API Endpoint
 * Handles all interactive components from Slack (shortcuts, view submissions, etc.)
 */

import { shortcutHandler, viewSubmissionHandler } from '../lib/interactions'
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
    // Handle shortcuts (global or message actions)
    if (payload.type === 'shortcut' || payload.type === 'message_action') {
      shortcutHandler(payload)
      return new Response('OK', { status: 200 })
    }

    // Handle view submissions
    if (payload.type === 'view_submission') {
      const response = await viewSubmissionHandler(payload)

      if (response) {
        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Default empty response if no specific handler response
      return new Response('', { status: 200 })
    }

    // Handle block actions
    if (payload.type === 'block_actions') {
      // Block actions handler would go here
      return new Response('OK', { status: 200 })
    }

    // Unhandled interaction type
    console.warn(`Unhandled interaction type: ${payload.type}`)
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error handling interaction:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
