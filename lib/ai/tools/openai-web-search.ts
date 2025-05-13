import { openai } from '@ai-sdk/openai'
import { AI_CONFIG } from '../../config'

export const openaiWebSearch = openai.tools.webSearchPreview({
  searchContextSize: AI_CONFIG.openaiWebSearchSettings.searchContextSize,
  userLocation: {
    type: 'approximate',
    country: AI_CONFIG.openaiWebSearchSettings.country,
    region: AI_CONFIG.openaiWebSearchSettings.region,
  },
})
