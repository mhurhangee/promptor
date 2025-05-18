import { getAllPrompts, searchPrompts } from '../db';

/**
 * Interface for prompt recommendation results
 */
interface PromptRecommendation {
  id: number;
  title: string;
  description: string;
  relevanceScore: number;
  reason: string;
}

/**
 * Simple placeholder for prompt recommendations
 * Currently uses basic keyword search without AI ranking
 * 
 * @param query User's query or context
 * @param limit Maximum number of prompts to recommend
 * @returns Array of recommended prompts
 */
export async function recommendPrompts(
  query: string,
  limit: number = 5
): Promise<PromptRecommendation[]> {
  try {
    // First try keyword search
    let prompts = await searchPrompts(query);
    
    // If no results, get all prompts
    if (prompts.length === 0) {
      prompts = await getAllPrompts();
    }
    
    // Limit results and format as recommendations
    return prompts.slice(0, limit).map((prompt, index) => ({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description || '',
      relevanceScore: 100 - (index * 10), // Simple descending score
      reason: 'Matched based on keywords',
    }));
  } catch (error) {
    console.error('Error recommending prompts:', error);
    return [];
  }
}
