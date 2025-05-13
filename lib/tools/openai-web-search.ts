import { openai } from '@ai-sdk/openai'

/**
 * Creates an OpenAI web search tool with the specified settings
 * @param settings Configuration for the web search tool
 * @returns Configured web search tool
 */
export function createWebSearchTool(settings: {
  searchContextSize?: 'low' | 'medium' | 'high'
  country?: string
  region?: string
}) {
  return openai.tools.webSearchPreview({
    searchContextSize: settings.searchContextSize || 'medium',
    userLocation: {
      type: 'approximate',
      country: settings.country || 'GB',
      region: settings.region || 'England',
    },
  })
}
