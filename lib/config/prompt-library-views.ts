import type { KnownBlock, View } from '@slack/web-api'

import type { Prompt } from '../db/prompt-library'

/**
 * Modal view for browsing prompts in the library
 * Includes search, filters, and a list of prompts
 */
export const browsePromptsView = (prompts: Prompt[] = [], category?: string): View => {
  // Categories for filtering prompts
  const categories = [
    { text: 'All Prompts', value: 'all' },
    { text: 'Writing', value: 'writing' },
    { text: 'Coding', value: 'coding' },
    { text: 'Data Analysis', value: 'data_analysis' },
    { text: 'Creative', value: 'creative' },
    { text: 'Business', value: 'business' },
    { text: 'Education', value: 'education' },
    { text: 'Other', value: 'other' },
  ]

  // Generate prompt list blocks
  const promptBlocks =
    prompts.length > 0
      ? prompts.flatMap((prompt, index) => {
          // Add a divider between prompts except for the first one
          const divider = index === 0 ? [] : [{ type: 'divider' }]

          return [
            ...divider,
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${prompt.title}*\n${prompt.description || 'No description provided'}`,
              },
              accessory: {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View',
                  emoji: true,
                },
                value: `${prompt.id}`,
                action_id: 'view_prompt_details',
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Category: ${prompt.category || 'Uncategorized'} | Added by <@${prompt.createdBy}>`,
                },
              ],
            },
          ]
        })
      : [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'No prompts found. Be the first to add one!',
            },
          },
        ]

  return {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'Prompt Library',
      emoji: true,
    },
    submit: {
      type: 'plain_text',
      text: 'Close',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: 'Cancel',
      emoji: true,
    },
    callback_id: 'prompt_library_browse',
    blocks: [
      // Header
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📚 Browse Prompts',
          emoji: true,
        },
      },

      // Category filter
      {
        type: 'input',
        block_id: 'category_block',
        optional: true,
        element: {
          type: 'static_select',
          action_id: 'category_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select a category',
            emoji: true,
          },
          initial_option: category
            ? {
                text: {
                  type: 'plain_text',
                  text: categories.find((c) => c.value === category)?.text || 'All Prompts',
                  emoji: true,
                },
                value: category,
              }
            : {
                text: {
                  type: 'plain_text',
                  text: categories[0].text,
                  emoji: true,
                },
                value: categories[0].value,
              },
          options: categories.map((cat) => ({
            text: {
              type: 'plain_text',
              text: cat.text,
              emoji: true,
            },
            value: cat.value,
          })),
        },
        label: {
          type: 'plain_text',
          text: 'Category',
          emoji: true,
        },
      },

      // Action buttons
      {
        type: 'actions',
        block_id: 'prompt_library_actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Create New Prompt',
              emoji: true,
            },
            action_id: 'create_prompt',
            style: 'primary',
          },
        ],
      } as KnownBlock,

      {
        type: 'divider',
      },

      // Prompt list section
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Available Prompts*',
        },
      },

      // Prompt list (dynamic based on search/filter)
      ...promptBlocks,
    ],
  }
}

/**
 * Modal view for creating a new prompt
 */
export const createPromptView: View = {
  type: 'modal',
  title: {
    type: 'plain_text',
    text: 'Create Prompt',
    emoji: true,
  },
  submit: {
    type: 'plain_text',
    text: 'Save',
    emoji: true,
  },
  close: {
    type: 'plain_text',
    text: 'Cancel',
    emoji: true,
  },
  callback_id: 'prompt_library_create',
  blocks: [
    // Header
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '✏️ Create New Prompt',
        emoji: true,
      },
    },

    // Title input
    {
      type: 'input',
      block_id: 'title_block',
      element: {
        type: 'plain_text_input',
        action_id: 'title_input',
        placeholder: {
          type: 'plain_text',
          text: 'Enter a title for your prompt',
        },
      },
      label: {
        type: 'plain_text',
        text: 'Title',
        emoji: true,
      },
    },

    // Description input
    {
      type: 'input',
      block_id: 'description_block',
      element: {
        type: 'plain_text_input',
        action_id: 'description_input',
        placeholder: {
          type: 'plain_text',
          text: 'Enter a brief description of what this prompt does',
        },
      },
      label: {
        type: 'plain_text',
        text: 'Description',
        emoji: true,
      },
    },

    // Content input
    {
      type: 'input',
      block_id: 'content_block',
      element: {
        type: 'plain_text_input',
        action_id: 'content_input',
        multiline: true,
        placeholder: {
          type: 'plain_text',
          text: 'Enter the full prompt text here',
        },
      },
      label: {
        type: 'plain_text',
        text: 'Prompt Content',
        emoji: true,
      },
    },

    // Category select
    {
      type: 'input',
      block_id: 'category_block',
      element: {
        type: 'static_select',
        action_id: 'category_select',
        placeholder: {
          type: 'plain_text',
          text: 'Select a category',
          emoji: true,
        },
        options: [
          {
            text: {
              type: 'plain_text',
              text: 'Writing',
              emoji: true,
            },
            value: 'writing',
          },
          {
            text: {
              type: 'plain_text',
              text: 'Coding',
              emoji: true,
            },
            value: 'coding',
          },
          {
            text: {
              type: 'plain_text',
              text: 'Data Analysis',
              emoji: true,
            },
            value: 'data_analysis',
          },
          {
            text: {
              type: 'plain_text',
              text: 'Creative',
              emoji: true,
            },
            value: 'creative',
          },
          {
            text: {
              type: 'plain_text',
              text: 'Business',
              emoji: true,
            },
            value: 'business',
          },
          {
            text: {
              type: 'plain_text',
              text: 'Education',
              emoji: true,
            },
            value: 'education',
          },
          {
            text: {
              type: 'plain_text',
              text: 'Other',
              emoji: true,
            },
            value: 'other',
          },
        ],
      },
      label: {
        type: 'plain_text',
        text: 'Category',
        emoji: true,
      },
    },

    // Tags input
    {
      type: 'input',
      block_id: 'tags_block',
      optional: true,
      element: {
        type: 'plain_text_input',
        action_id: 'tags_input',
        placeholder: {
          type: 'plain_text',
          text: 'Enter tags separated by commas (e.g., writing, email, professional)',
        },
      },
      label: {
        type: 'plain_text',
        text: 'Tags',
        emoji: true,
      },
    },
  ],
}

/**
 * Modal view for viewing prompt details
 */
export const promptDetailView = (prompt: Prompt & { userHasUpvoted?: boolean }): View => {
  return {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'Prompt Details',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: 'Close',
      emoji: true,
    },
    callback_id: 'prompt_library_detail',
    blocks: [
      // Header with prompt title
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: prompt.title,
          emoji: true,
        },
      },

      // Metadata
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Category: ${prompt.category || 'Uncategorized'} | Added by <@${prompt.createdBy}>`,
          },
        ],
      },

      // Description
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description*\n${prompt.description || 'No description provided'}`,
        },
      },

      {
        type: 'divider',
      },

      // Prompt content
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Prompt Content*',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${prompt.content}\`\`\``,
        },
      },

      {
        type: 'divider',
      },

      // Action buttons
      {
        type: 'actions',
        block_id: 'prompt_actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Copy Prompt',
              emoji: true,
            },
            value: `${prompt.id}`,
            action_id: 'copy_prompt',
            style: 'primary',
          },
        ],
      } as KnownBlock,
    ],
  }
}
