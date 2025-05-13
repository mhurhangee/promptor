import crypto from 'node:crypto'

// See https://api.slack.com/authentication/verifying-requests-from-slack
export async function isValidSlackRequest({
  request,
  rawBody,
}: {
  request: Request
  rawBody: string
}) {
  const timestamp = request.headers.get('X-Slack-Request-Timestamp')
  const slackSignature = request.headers.get('X-Slack-Signature')

  if (!timestamp || !slackSignature) {
    console.error('Missing timestamp or signature')
    return false
  }

  // Prevent replay attacks on the order of 5 minutes
  if (Math.abs(Date.now() / 1000 - Number.parseInt(timestamp)) > 60 * 5) {
    console.error('Timestamp out of range')
    return false
  }

  const base = `v0:${timestamp}:${rawBody}`
  const hmac = crypto
    .createHmac('sha256', process.env.SLACK_SIGNING_SECRET ?? '')
    .update(base)
    .digest('hex')
  const computedSignature = `v0=${hmac}`

  // Prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(slackSignature))
}

export const verifyRequest = async ({
  requestType,
  request,
  rawBody,
}: {
  requestType: string
  request: Request
  rawBody: string
}) => {
  const validRequest = await isValidSlackRequest({ request, rawBody })
  if (!validRequest || requestType !== 'event_callback') {
    return new Response('Invalid request', { status: 400 })
  }
}
