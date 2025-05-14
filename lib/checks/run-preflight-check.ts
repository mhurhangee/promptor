import type { CoreMessage } from 'ai'
import { checkModeration } from './check-moderation'
import { checkRelevancy } from './check-relevancy'

export interface PreflightCheckResult {
  passed: boolean
  errorMessage?: string
  redactedMessage?: CoreMessage
}

//Runs all preflight checks on the messages
export async function runPreflightChecks(messages: CoreMessage[]): Promise<PreflightCheckResult> {
  // Run moderation check first
  const moderationResult = await checkModeration(messages)
  if (!moderationResult.passed) {
    return moderationResult
  }

  // Run relevancy check if moderation passed
  const relevancyResult = await checkRelevancy(messages)
  if (!relevancyResult.passed) {
    return relevancyResult
  }

  // All checks passed
  return { passed: true }
}
