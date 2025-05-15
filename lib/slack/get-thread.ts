import type {
  CoreAssistantMessage,
  CoreMessage,
  CoreUserMessage,
  FilePart,
  ImagePart,
  TextPart,
} from 'ai'

import { generateTranscription } from '../ai/generate-transcription'
import type { HeliconeTrackingData } from '../ai/helicone-utils'
import { AI_CONFIG } from '../config'
import { client } from './client'
import { getFileAsBase64 } from './get-file-as-base64'

export async function getThread(
  channel_id: string,
  thread_ts: string,
  trackingData: HeliconeTrackingData,
  updateStatus?: (status: string) => void
): Promise<CoreMessage[]> {
  updateStatus?.(' is reading the thread...')

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

    // Skip messages without text or files
    if (!message.text && (!message.files || message.files.length === 0)) continue

    // Handle regular text messages
    if (message.text && !message.files) {
      if (isBot) {
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
          // Only process files that are supported types
          if (file.id) {
            const { base64, mimeType, filename } = await getFileAsBase64(file.id)

            // Check if this is an audio or video file that can be transcribed
            const isTranscribable = [
              'audio/mp3',
              'audio/mp4',
              'audio/mpeg',
              'audio/mpga',
              'audio/m4a',
              'audio/wav',
              'audio/webm',
              'video/mp4',
              'video/webm',
            ].includes(mimeType)

            // Handle audio/video files that can be transcribed
            if (isTranscribable) {
              // Check if Slack already has a transcription
              let transcription = ''

              if (
                file.transcription &&
                file.transcription.status === 'complete' &&
                file.transcription.preview &&
                file.transcription.preview.content
              ) {
                // Use Slack's transcription
                transcription = file.transcription.preview.content
              } else {
                // No Slack transcription available, use our own
                updateStatus?.('👂 transcribing audio (this may take a few seconds)...')

                // Create tracking data for Helicone observability
                trackingData.operation = 'generateTranscription'

                transcription = await generateTranscription(base64, trackingData)
              }

              // Find existing text part or create one
              const textPartIndex = contentParts.findIndex((part) => part.type === 'text')

              if (textPartIndex >= 0) {
                // Append to existing text part
                const textPart = contentParts[textPartIndex] as TextPart
                textPart.text += `\n\n[The following audio message was attached to this thread and has been transcribed]: ${transcription}`
              } else {
                // Create new text part
                contentParts.push({
                  type: 'text' as const,
                  text: `[The following audio message was attached to this thread and has been transcribed]: ${transcription}`,
                })
              }
            }
            // Handle images
            else if (mimeType.startsWith('image/')) {
              contentParts.push({
                type: 'image' as const,
                image: base64,
              })
            }
            // Handle PDFs
            else if (mimeType === 'application/pdf') {
              contentParts.push({
                type: 'file' as const,
                mimeType,
                data: base64,
                filename,
              })
            }
            // Handle other file types (unsupported)
            else {
              console.log(`Skipping unsupported file type: ${mimeType}`)
            }
          }
        } catch (error) {
          console.error('Error processing file:', error)
          // Continue with other files if one fails
        }
      }

      // Add the message with content parts
      if (contentParts.length > 0) {
        if (isBot) {
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
