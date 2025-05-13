import { client } from './client'

export const getBotId = async () => {
  const { user_id: botUserId } = await client.auth.test()

  if (!botUserId) {
    throw new Error('botUserId is undefined')
  }
  return botUserId
}
