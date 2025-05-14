/**
 * Transcribes audio content using OpenAI's Whisper model
 */
import { experimental_transcribe as transcribe } from 'ai'
import { AI_CONFIG } from '../config'
import { type HeliconeTrackingData, generateHeliconeHeaders } from './helicone-utils'

/**
 * Transcribes audio data using OpenAI's Whisper model
 * @param audioData Base64 encoded audio data
 * @param trackingData Optional Helicone tracking data for observability
 * @returns The transcribed text
 */
export async function generateTranscription(
  audioData: string,
  trackingData?: HeliconeTrackingData
): Promise<string> {
  try {
    // Generate Helicone tracking headers if tracking data is provided
    const heliconeHeaders = trackingData
      ? generateHeliconeHeaders(
          {
            ...trackingData,
            operation: 'generateTranscription',
          },
          true,
          false
        ) // Enable caching, disable rate limiting for transcription
      : {}

    const transcript = await transcribe({
      model: AI_CONFIG.audioModel,
      audio: audioData,
      providerOptions: AI_CONFIG.audioProviderOptions,
      headers: heliconeHeaders,
    })

    return transcript.text
  } catch (error) {
    console.error('Transcription error:', error)
    return '[Transcription failed]'
  }
}
