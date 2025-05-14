/**
 * Helicone utilities for tracking, caching, and rate limiting
 * Provides consistent header generation for Helicone observability
 */

/**
 * Interface for Slack event data needed for Helicone tracking
 */
export interface HeliconeTrackingData {
  userId: string
  channelId: string
  threadTs?: string
  messageTs?: string
  botId?: string
  operation?: string
}

/**
 * Generate Helicone headers for tracking, session management, and other features
 * @param data Slack event data for tracking
 * @param enableCache Whether to enable response caching
 * @param rateLimit Whether to apply rate limiting
 * @returns Headers object to pass to AI SDK calls
 */
export function generateHeliconeHeaders(
  data: HeliconeTrackingData,
  enableCache = false,
  rateLimit = false
): Record<string, string> {
  const headers: Record<string, string> = {}

  // User tracking
  if (data.userId) {
    headers['Helicone-User-Id'] = data.userId
  }

  // Custom properties for filtering and analysis
  headers['Helicone-Property-Channel'] = data.channelId

  if (data.operation) {
    headers['Helicone-Property-Operation'] = data.operation
  }

  if (data.botId) {
    headers['Helicone-Property-BotId'] = data.botId
  }

  // Session tracking (group related requests into conversations)
  if (data.threadTs) {
    // Use thread timestamp as session ID to group messages in the same thread
    headers['Helicone-Session-Id'] = `${data.channelId}-${data.threadTs}`
    headers['Helicone-Session-Name'] = `Conversation in #${data.channelId}`
    headers['Helicone-Session-Path'] = `/channels/${data.channelId}/threads/${data.threadTs}`
  }

  // Enable caching if requested
  if (enableCache) {
    headers['Helicone-Cache-Enabled'] = 'true'
  }

  // Apply rate limiting if requested
  // Default: 100 requests per hour per user
  if (rateLimit) {
    headers['Helicone-RateLimit-Policy'] = '100;w=3600;s=user'
  }

  return headers
}
