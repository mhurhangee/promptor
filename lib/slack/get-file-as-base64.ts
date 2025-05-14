import { client } from './client'

//Fetches a file from Slack and converts it to base64
export async function getFileAsBase64(fileId: string): Promise<{
  base64: string
  mimeType: string
  filename: string
}> {
  try {
    // Get file info from Slack
    const fileInfo = await client.files.info({
      file: fileId,
    })

    if (!fileInfo.file || !fileInfo.file.url_private) {
      throw new Error('File not found or missing URL')
    }

    // Get the file data using fetch with bearer token
    const response = await fetch(fileInfo.file.url_private, {
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
    }

    // Get array buffer and convert to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    return {
      base64,
      mimeType: fileInfo.file.mimetype || 'application/octet-stream',
      filename: fileInfo.file.name || 'file',
    }
  } catch (error) {
    console.error('Error fetching file:', error)
    throw new Error('Failed to fetch file from Slack')
  }
}
