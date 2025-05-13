import { client } from '../slack'

export const updateTitleUtil = (channel: string, thread_ts: string) => {
  return async (title: string) => {
    await client.assistant.threads.setTitle({
      channel_id: channel,
      thread_ts: thread_ts,
      title: title,
    })
  }
}
