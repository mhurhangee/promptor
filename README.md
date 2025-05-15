# Promptor - AI-tutor slackbot

An opinionated AI-tutor slackbot. Based on [AI SDK Slackbot](https://github.com/vercel-labs/ai-sdk-slackbot). See Roadmap for changes and features.

## Quick setup

1. Clone the repository
2. Create a new Slack app (see example `manifest.json`) and install it to your workspace
3. Deploy to Vercel
4. Add the following environment variables to your Vercel project (see `.env.example`)

## Roadmap
- ✅ Add example `manifest.json`
- ✅ Add home tab
- ✅ Add formatting and linting (using biome)
- ✅ Add pre-commit hooks (using lint-staged and husky)
- ✅ Add markdown conversion for responses (using slackify-markdown)
- ✅ Refactor codebase to be more modular (split into `/lib` and `/api`)
- ✅ Refactor to include `/lib/config` to enable easy configuration of slackbot and assistant
- ✅ Add personality (new system prompt and randomisation of welcome messages, thinking messages, followup titles and initial followups)
- ✅ Remove exa and weather tools
- ✅ Improve assistant message handling in line with usage in slack/bolt.js 
- ✅ Disable app mentions to focus on assistant threads
- ✅ Add image and file upload support (convert to base64 message parts which is supported by OpenAI responses)
- ✅ Remove slack's boilerplate messages from get thread
- ✅ Add support for web search (using OpenAI responses built-in web search)
- ✅ Add support for structured output (AI-generated followup messages and titles)
- ✅ Error handling for generate response (basic)
- ✅ Add moderation for input and output (OpenAI moderation & structured outputs)
- ✅ Image and file error handling (basic)
- ✅ Transcribe voice (/video) inputs (using whisper and slack's transcription)
- ✅ Tracing/analytics/monitoring/rate limits/caching all possible with Helicone (requires further integration)
- ⬜ Shortcut/reaction to retry/regenerate
- ⬜ Switchable personalities
- ⬜ Token limits?
- ⬜ Add support for AI-generated images?
- ⬜ Reactions as feedback?
- ⬜ Additional Helicone integration?


