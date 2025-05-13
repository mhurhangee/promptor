import type {
  CoreAssistantMessage,
  CoreMessage,
  CoreUserMessage,
  FilePart,
  ImagePart,
  TextPart,
} from 'ai'

import { AI_CONFIG } from '../config'
import { client } from './client'
import { getFileAsBase64 } from './get-file-as-base64'

export async function getThread(channel_id: string, thread_ts: string): Promise<CoreMessage[]> {
  const { messages } = await client.conversations.replies({
    channel: channel_id,
    ts: thread_ts,
    limit: AI_CONFIG.maxMessagesInThread,
  })

  // Ensure we have messages
  if (!messages) throw new Error('No messages found in thread')

  // Process messages to convert them to CoreMessage format
  const result: CoreMessage[] = []

  for (const message of messages) {
    const isBot = !!message.bot_id
    const role = isBot ? 'assistant' : 'user'

    // Skip messages without text or files
    if (!message.text && (!message.files || message.files.length === 0)) continue

    // Handle regular text messages
    if (message.text && !message.files) {
      if (role === 'assistant') {
        result.push({
          role: 'assistant',
          content: message.text,
        } as CoreAssistantMessage)
      } else {
        result.push({
          role: 'user',
          content: message.text,
        } as CoreUserMessage)
      }
      continue
    }

    // Handle messages with files
    if (message.files && message.files.length > 0) {
      const contentParts: (TextPart | ImagePart | FilePart)[] = []

      // Add text part if it exists
      if (message.text) {
        contentParts.push({
          type: 'text' as const,
          text: message.text,
        })
      }

      // Process each file
      for (const file of message.files) {
        try {
          // Only process files that are images, PDFs, or other supported types
          if (file.id) {
            const { base64, mimeType, filename } = await getFileAsBase64(file.id)

            // Determine if this is an image or other file type
            if (mimeType.startsWith('image/')) {
              contentParts.push({
                type: 'image' as const,
                image: base64,
              })
            } else {
              contentParts.push({
                type: 'file' as const,
                mimeType,
                data: base64,
                filename,
              })
            }
          }
        } catch (error) {
          console.error('Error processing file:', error)
          // Continue with other files if one fails
        }
      }

      // Add the message with content parts
      if (contentParts.length > 0) {
        if (role === 'assistant') {
          result.push({
            role: 'assistant',
            content: contentParts,
          } as CoreAssistantMessage)
        } else {
          result.push({
            role: 'user',
            content: contentParts,
          } as CoreUserMessage)
        }
      }
    }
  }

  // Skip the first two messages which are boilerplate:
  // 1. "New Assistant Thread" (from Slack)
  // 2. The welcome message from the bot
  return result.length >= 2 ? result.slice(2) : result
}
