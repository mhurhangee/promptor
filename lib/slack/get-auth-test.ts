import { client } from './client'

export const getAuthTest = async () => {
  const result = await client.auth.test()

  if (!result) {
    throw new Error('auth test failed')
  }

  return result
}
