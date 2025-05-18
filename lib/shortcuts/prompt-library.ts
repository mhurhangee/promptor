// Define types locally since we don't have @slack/bolt
type ShortcutEvent = {
  body: {
    trigger_id: string;
    user: {
      id: string;
    };
  };
  ack: () => Promise<void>;
};
import { client } from '../slack/client';
import { 
  browsePromptsView, 
  createPromptView 
} from '../config/prompt-library-views';
import { getAllPrompts } from '../db';

/**
 * Handle the "Browse Prompts" global shortcut
 */
export const handleBrowsePromptsShortcut = async ({ ack, body }: ShortcutEvent) => {
  try {
    await ack();
    
    // Get all prompts from the database
    const prompts = await getAllPrompts();
    
    // Open the browse prompts modal
    await client.views.open({
      trigger_id: body.trigger_id,
      view: browsePromptsView(prompts),
    });
  } catch (error) {
    console.error('Error opening prompt library from shortcut:', error);
  }
};

/**
 * Handle the "Create Prompt" global shortcut
 */
export const handleCreatePromptShortcut = async ({ ack, body }: ShortcutEvent) => {
  try {
    await ack();
    
    // Open the create prompt modal
    await client.views.open({
      trigger_id: body.trigger_id,
      view: createPromptView,
    });
  } catch (error) {
    console.error('Error opening create prompt modal from shortcut:', error);
  }
};
