import slackifyMarkdown from 'slackify-markdown'

export const mrkdwn = (text: string) => slackifyMarkdown(text)
