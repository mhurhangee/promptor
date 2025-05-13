# Promptor - AI-tutor slackbot

Based on [AI SDK Slackbot](https://github.com/vercel-labs/ai-sdk-slackbot)

## Quick setup

1. Clone the repository
2. Create a new Slack app (`manifest.json`) and install it to your workspace
3. Deploy to Vercel
4. Add the following environment variables to your Vercel project:

```
SLACK_BOT_TOKEN=your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
OPENAI_API_KEY=your-openai-api-key
```

## Tech stack
- Slack web-api
- AI SDK
- TypeScript
- Vercel
- Biome
- Husky
- Lint-staged

## Roadmap/changes
- ✅ Add example `manifest.json`
- ✅ Add home tab
- ✅ Add formatting and linting (using biome)
- ✅ Add pre-commit hooks (using lint-staged and husky)
- ✅ Add markdown conversion for responses (using slackify-markdown)
- ✅ Refactor codebase to be more modular
- ✅ Add `/lib/config` to enable easy configuration of assistant
- ✅ Add randomisation of welcome messages, thinking messages, followup titles and initial followups
- ✅ Remove exa and weather tools
- ✅ Improve assistant message handling in line with usage in slack/bolt.js
- ✅ Disable app mentions to focus on assistant threads
- ✅ Add image and file upload support
- ✅ Remove boilerplate messages from get thread
- ✅ Add support for web search
- ✅ Improved system prompt
- ⬜ Add moderation (for input and output)
- ⬜ Add support for AI-generated followup messages
- ⬜ Add support for AI-generated titles
- ⬜ Add support for AI-generated message titles
- ⬜ Better error handling for generate response
- ⬜ Switchable personalities


