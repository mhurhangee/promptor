import type { GenericMessageEvent } from '@slack/web-api';
import { client } from '../slack/client';
import { recommendPrompts } from '../ai';
import { postMessage } from '../slack';

/**
 * Handle the /prompts command in assistant threads
 * Searches the prompt library and recommends relevant prompts
 */
export const handlePromptCommand = async (event: GenericMessageEvent) => {
  try {
    // Extract the search query from the message
    // Format: /prompts [search query]
    const message = event.text || '';
    const promptCommandRegex = /^\/prompts\s+(.+)$/i;
    const match = message.match(promptCommandRegex);
    
    if (!match) {
      // If no query provided, show help message
      await postMessage(
        'To search the prompt library, use `/prompts [search query]`',
        'Prompt Library Help',
        event.channel,
        event.thread_ts || event.ts
      );
      return;
    }
    
    const query = match[1].trim();
    
    // Show typing indicator
    await client.chat.postEphemeral({
      channel: event.channel,
      user: event.user,
      text: 'Searching prompt library...',
    });
    
    // Search for relevant prompts
    const recommendations = await recommendPrompts(query);
    
    if (recommendations.length === 0) {
      await postMessage(
        'No matching prompts found. Try a different search query or create a new prompt.',
        'Prompt Search Results',
        event.channel,
        event.thread_ts || event.ts
      );
      return;
    }
    
    // Format the recommendations
    const promptList = recommendations
      .map((rec, index) => {
        return `*${index + 1}. ${rec.title}* (Score: ${rec.relevanceScore})\n${rec.description}\n_Reason: ${rec.reason}_`;
      })
      .join('\n\n');
    
    // Post the recommendations
    await postMessage(
      `*Found ${recommendations.length} relevant prompts for "${query}":*\n\n${promptList}`,
      'Prompt Search Results',
      event.channel,
      event.thread_ts || event.ts
    );
  } catch (error) {
    console.error('Error handling prompt command:', error);
    
    // Send error message
    await postMessage(
      'Sorry, there was an error searching the prompt library. Please try again later.',
      'Prompt Library Error',
      event.channel,
      event.thread_ts || event.ts
    );
  }
};
