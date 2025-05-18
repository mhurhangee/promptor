// Define types locally since we don't have @slack/bolt
type BlockAction = {
  body: {
    trigger_id: string;
    user: {
      id: string;
    };
    view?: {
      id: string;
      state: {
        values: Record<string, Record<string, any>>;
      };
    };
  };
  ack: () => Promise<void>;
  action: {
    action_id: string;
    value: string;
  };
};

type ViewSubmitAction = {
  body: {
    user: {
      id: string;
    };
  };
  ack: (response?: any) => Promise<void>;
  view: {
    state: {
      values: Record<string, Record<string, any>>;
    };
  };
};
import { client } from '../slack/client';
import { 
  browsePromptsView, 
  createPromptView, 
  promptDetailView 
} from '../config/prompt-library-views';
import { 
  getAllPrompts, 
  getPromptById, 
  createPrompt, 
  searchPrompts, 
  upvotePrompt, 
  getPromptsByTag 
} from '../db';

/**
 * Handle opening the prompt library browse view
 */
export const handleOpenPromptLibrary = async ({ body, ack }: BlockAction) => {
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
    console.error('Error opening prompt library:', error);
  }
};

/**
 * Handle creating a new prompt
 */
export const handleCreatePrompt = async ({ body, ack }: BlockAction) => {
  try {
    await ack();
    
    // Open the create prompt modal
    await client.views.open({
      trigger_id: body.trigger_id,
      view: createPromptView,
    });
  } catch (error) {
    console.error('Error opening create prompt modal:', error);
  }
};

/**
 * Handle submitting a new prompt
 */
export const handleSubmitPrompt = async ({ body, ack, view }: ViewSubmitAction) => {
  try {
    // Get form values
    const title = view.state.values.title_block.title_input.value;
    const description = view.state.values.description_block.description_input.value;
    const content = view.state.values.content_block.content_input.value;
    const category = view.state.values.category_block.category_select.selected_option.value;
    const tagsInput = view.state.values.tags_block.tags_input.value;
    
    // Process tags (split by comma and trim)
    const tags = tagsInput ? tagsInput.split(',').map((tag: string) => tag.trim()) : [];
    
    // Create the new prompt in the database
    await createPrompt({
      title,
      description,
      content,
      category,
      tags,
      createdBy: body.user.id,
      upvotes: 0,
    });
    
    await ack();
    
    // Send a confirmation message to the user
    await client.chat.postMessage({
      channel: body.user.id,
      text: `✅ Your prompt "${title}" has been added to the library!`,
    });
  } catch (error) {
    console.error('Error creating prompt:', error);
    await ack({
      response_action: 'errors',
      errors: {
        title_block: 'There was an error creating your prompt. Please try again.',
      },
    });
  }
};

/**
 * Handle viewing prompt details
 */
export const handleViewPromptDetails = async ({ body, ack, action }: BlockAction) => {
  try {
    await ack();
    
    // Get the prompt ID from the button value
    const promptId = parseInt(action.value);
    
    // Get the prompt from the database
    const prompt = await getPromptById(promptId);
    
    if (!prompt) {
      throw new Error(`Prompt with ID ${promptId} not found`);
    }
    
    // Check if user has upvoted this prompt
    const userUpvoted = false; // TODO: Implement this check
    
    // Add the upvote status to the prompt object
    const promptWithUpvoteStatus = {
      ...prompt,
      userHasUpvoted: userUpvoted,
    };
    
    // Open the prompt detail modal
    await client.views.open({
      trigger_id: body.trigger_id,
      view: promptDetailView(promptWithUpvoteStatus),
    });
  } catch (error) {
    console.error('Error viewing prompt details:', error);
  }
};

/**
 * Handle upvoting a prompt
 */
export const handleToggleUpvote = async ({ body, ack, action }: BlockAction) => {
  try {
    await ack();
    
    // Get the prompt ID from the button value
    const promptId = parseInt(action.value);
    
    // Toggle the upvote in the database
    const upvoteAdded = await upvotePrompt(promptId, body.user.id);
    
    // Get the updated prompt
    const updatedPrompt = await getPromptById(promptId);
    
    if (!updatedPrompt) {
      throw new Error(`Prompt with ID ${promptId} not found`);
    }
    
    // Add the upvote status to the prompt object
    const promptWithUpvoteStatus = {
      ...updatedPrompt,
      userHasUpvoted: upvoteAdded,
    };
    
    // Check if view exists
    if (!body.view) {
      console.error('View is undefined in handleToggleUpvote');
      return;
    }
    
    // Update the modal with the new upvote count
    await client.views.update({
      view_id: body.view.id,
      view: promptDetailView(promptWithUpvoteStatus),
    });
  } catch (error) {
    console.error('Error toggling upvote:', error);
  }
};

/**
 * Handle searching prompts
 */
export const handleSearchPrompts = async ({ body, ack }: BlockAction) => {
  try {
    await ack();
    
    // Check if view exists
    if (!body.view) {
      console.error('View is undefined in handleSearchPrompts');
      return;
    }
    
    // Get the search query and category from the view state
    const searchQuery = body.view.state.values.search_block.search_input.value;
    const categoryOption = body.view.state.values.category_block.category_select.selected_option;
    const category = categoryOption ? categoryOption.value : null;
    
    let prompts = [];
    
    if (searchQuery && searchQuery.trim() !== '') {
      // Search prompts by query
      prompts = await searchPrompts(searchQuery);
    } else if (category && category !== 'all') {
      // Filter prompts by category
      prompts = await getAllPrompts(category);
    } else {
      // Get all prompts
      prompts = await getAllPrompts();
    }
    
    // Update the view with the search results
    await client.views.update({
      view_id: body.view.id,
      view: browsePromptsView(prompts, category),
    });
  } catch (error) {
    console.error('Error searching prompts:', error);
  }
};

/**
 * Handle copying a prompt to clipboard
 * Note: Slack doesn't provide direct clipboard access, so we'll DM the prompt to the user
 */
export const handleCopyPrompt = async ({ body, ack, action }: BlockAction) => {
  try {
    await ack();
    
    // Get the prompt ID from the button value
    const promptId = parseInt(action.value);
    
    // Get the prompt from the database
    const prompt = await getPromptById(promptId);
    
    if (!prompt) {
      throw new Error(`Prompt with ID ${promptId} not found`);
    }
    
    // Send the prompt content to the user as a DM
    await client.chat.postMessage({
      channel: body.user.id,
      text: `Here's the prompt you requested:\n\n*${prompt.title}*\n\n\`\`\`\n${prompt.content}\n\`\`\``,
    });
  } catch (error) {
    console.error('Error copying prompt:', error);
  }
};
