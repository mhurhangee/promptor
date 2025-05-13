import { client } from './client'

export const postMessage = async (
  text: string,
  title: string,
  channel: string,
  thread_ts: string
) => {
  await client.chat.postMessage({
    channel,
    thread_ts,
    text,
    unfurl_links: false,
    blocks: [
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: title,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      },
    ],
  })
}
