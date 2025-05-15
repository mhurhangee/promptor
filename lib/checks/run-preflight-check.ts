import type { CoreMessage } from 'ai'
import { checkModeration } from './check-moderation'
import { checkRelevancy } from './check-relevancy'

export interface PreflightCheckResult {
  passed: boolean
  errorMessage?: string
  redactedMessage?: CoreMessage
}

//Runs all preflight checks on the messages in parallel
export async function runPreflightChecks(messages: CoreMessage[]): Promise<PreflightCheckResult> {
  // Run checks simultaneously
  const [moderationResult, relevancyResult] = await Promise.all([
    checkModeration(messages),
    checkRelevancy(messages),
  ])

  // Check moderation result first
  if (!moderationResult.passed) {
    return moderationResult
  }

  // Then check relevancy result
  if (!relevancyResult.passed) {
    return relevancyResult
  }

  // All checks passed
  return { passed: true }
}
