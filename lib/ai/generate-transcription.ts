/**
 * Transcribes audio content using OpenAI's Whisper model
 */
import { experimental_transcribe as transcribe } from 'ai'
import { AI_CONFIG } from '../config'

/**
 * Transcribes audio data using OpenAI's Whisper model
 * @param audioData Base64 encoded audio data
 * @returns The transcribed text
 */
export async function generateTranscription(audioData: string): Promise<string> {
  try {
    const transcript = await transcribe({
      model: AI_CONFIG.audioModel,
      audio: audioData,
      providerOptions: AI_CONFIG.audioProviderOptions,
    })

    return transcript.text
  } catch (error) {
    console.error('Transcription error:', error)
    return '[Transcription failed]'
  }
}
