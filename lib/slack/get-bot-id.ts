import { client } from '@/lib/slack'

export const getBotId = async () => {
  const { user_id: botUserId } = await client.auth.test()

  if (!botUserId) {
    throw new Error('botUserId is undefined')
  }
  return botUserId
}
