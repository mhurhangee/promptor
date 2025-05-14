import type { CoreMessage } from 'ai'
import type { PreflightCheckResult } from './run-preflight-check'

interface ModerationResponse {
  id: string
  model: string
  results: Array<{
    flagged: boolean
    categories: Record<string, boolean>
    category_scores: Record<string, number>
    category_applied_input_types?: Record<string, string[]>
  }>
}

//
export async function checkModeration(messages: CoreMessage[]): Promise<PreflightCheckResult> {
  try {
    // Only check the last message (from the user)
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user') {
      return { passed: true }
    }

    const inputs: Array<{ type: string; text?: string; image_url?: { url: string } }> = []

    // Process the content based on its type
    if (typeof lastMessage.content === 'string') {
      // Handle simple text message
      inputs.push({ type: 'text', text: lastMessage.content })
    } else if (Array.isArray(lastMessage.content)) {
      // Handle content parts (text and images)
      for (const part of lastMessage.content) {
        if (part.type === 'text') {
          inputs.push({ type: 'text', text: part.text })
        } else if (part.type === 'image') {
          // Convert base64 to data URL for image moderation
          const dataUrl = `data:image/jpeg;base64,${part.image}`
          inputs.push({
            type: 'image_url',
            image_url: { url: dataUrl },
          })
        }
        // Skip file parts as they're not supported by the moderation API
      }
    }

    // Skip if there's nothing to moderate
    if (inputs.length === 0) {
      return { passed: true }
    }

    // Log the request payload for debugging
    const requestPayload = {
      model: 'omni-moderation-latest',
      input: inputs,
    }
    console.log('==> Moderation API Request:', JSON.stringify(requestPayload, null, 2))

    // Call OpenAI moderation API directly using fetch
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestPayload),
    })

    if (!response.ok) {
      throw new Error(`Moderation API error: ${response.status} ${response.statusText}`)
    }

    const moderation = (await response.json()) as ModerationResponse

    // Log the moderation response for debugging
    console.log('==> Moderation API Response:', JSON.stringify(moderation, null, 2))

    // Check if any input was flagged
    const flagged = moderation.results.some((result) => result.flagged)

    // Log the flagged status
    console.log('==> Content flagged:', flagged)

    if (flagged) {
      // Create a redacted version of the message
      let redactedMessage: CoreMessage

      if (typeof lastMessage.content === 'string') {
        // Redact text message
        redactedMessage = {
          ...lastMessage,
          content: '[Content redacted due to moderation policy]',
        }
      } else if (Array.isArray(lastMessage.content)) {
        // Redact content parts
        const redactedParts = lastMessage.content.map((part) => {
          if (part.type === 'text') {
            return { ...part, text: '[Content redacted due to moderation policy]' }
          }
          if (part.type === 'image') {
            return { type: 'text' as const, text: '[Image redacted due to moderation policy]' }
          }
          return part
        })

        redactedMessage = {
          ...lastMessage,
          content: redactedParts,
        }
      } else {
        redactedMessage = lastMessage
      }

      return {
        passed: false,
        errorMessage:
          'Your message contains content that violates our moderation policy. It has been redacted.',
        redactedMessage,
      }
    }

    return { passed: true }
  } catch (error) {
    console.error('Moderation check failed:', error)
    // If moderation check fails, we allow the message to pass
    // This is to prevent blocking legitimate messages due to API issues
    return { passed: true }
  }
}
