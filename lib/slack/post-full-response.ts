import type { ResponseSchema } from '../config'
import { postMessage, setFollowupsUtil, updateTitleUtil } from '../slack'

export const postFullResponse = async (
  output: ResponseSchema,
  channel: string,
  thread_ts: string
) => {
  await updateTitleUtil(channel, thread_ts)(output.threadTitle)

  await postMessage(output.response, output.responseTitle, channel, thread_ts)

  await setFollowupsUtil(channel, thread_ts, output.followUps ?? [])
}
